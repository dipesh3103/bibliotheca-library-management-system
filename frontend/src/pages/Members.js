import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function MemberModal({ member, onClose, onSave }) {
  const isEdit = !!member?._id;
  const [form, setForm] = useState({
    name: '', email: '', phone: '', membershipType: 'Standard', status: 'Active',
    address: { street: '', city: '', state: '', zipCode: '' },
    ...(member || {})
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setSaving(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/members/${member._id}`, form);
        onSave(res.data, 'update');
        toast.success('Member updated');
      } else {
        const res = await axios.post('/api/members', form);
        onSave(res.data, 'add');
        toast.success('Member added');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving member');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Member' : 'Add New Member'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Membership Type</label>
                <select className="form-select" value={form.membershipType} onChange={e => set('membershipType', e.target.value)}>
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>Student</option>
                </select>
              </div>
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Address (Optional)</p>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input className="form-input" value={form.address?.street || ''} onChange={e => set('address', { ...form.address, street: e.target.value })} placeholder="Street address" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.address?.city || ''} onChange={e => set('address', { ...form.address, city: e.target.value })} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={form.address?.state || ''} onChange={e => set('address', { ...form.address, state: e.target.value })} placeholder="State" />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/members', { params: { page, limit: 10, search, status, membershipType } });
      setMembers(res.data.members);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, [page, search, status, membershipType]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSave = (member, type) => {
    if (type === 'add') setMembers(m => [member, ...m]);
    else setMembers(m => m.map(x => x._id === member._id ? member : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await axios.delete(`/api/members/${id}`);
      setMembers(m => m.filter(x => x._id !== id));
      toast.success('Member deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const statusBadge = s => ({ Active: 'badge-green', Inactive: 'badge-gray', Suspended: 'badge-red' }[s] || 'badge-gray');
  const typeBadge = t => ({ Premium: 'badge-gold', Standard: 'badge-blue', Student: 'badge-purple' }[t] || 'badge-gray');

  const daysUntilExpiry = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      <div className="page-header">
        <h1>Members</h1>
        <p>Manage library membership</p>
      </div>
      <div className="page-body">
        <div className="filters-row">
          <div className="search-bar">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by name, email, member ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option>Active</option><option>Inactive</option><option>Suspended</option>
          </select>
          <select className="filter-select" value={membershipType} onChange={e => { setMembershipType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option>Standard</option><option>Premium</option><option>Student</option>
          </select>
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setModal('add')}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Member
          </button>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3>All Members <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({total})</span></h3>
          </div>

          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : members.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <h3>No members found</h3>
              <p>Add your first member to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Member ID</th>
                  <th>Type</th>
                  <th>Books Out</th>
                  <th>Fines</th>
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => {
                  const days = daysUntilExpiry(member.membershipEnd);
                  const unpaidFines = member.totalFines - member.paidFines;
                  return (
                    <tr key={member._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{member.name.charAt(0)}</div>
                          <div>
                            <strong>{member.name}</strong>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><code style={{ fontSize: 12, background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>{member.memberId}</code></td>
                      <td><span className={`badge ${typeBadge(member.membershipType)}`}>{member.membershipType}</span></td>
                      <td>
                        <span style={{ fontWeight: 600, color: member.booksCheckedOut > 0 ? 'var(--blue)' : 'var(--text-muted)' }}>
                          {member.booksCheckedOut}
                        </span>
                      </td>
                      <td>
                        {unpaidFines > 0
                          ? <span style={{ color: 'var(--red)', fontWeight: 600 }}>₹{unpaidFines}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div style={{ color: days < 30 ? 'var(--orange)' : 'var(--text-secondary)' }}>
                          {days < 0 ? <span style={{ color: 'var(--red)' }}>Expired</span> : `${days}d left`}
                        </div>
                      </td>
                      <td><span className={`badge ${statusBadge(member.status)}`}>{member.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(member)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(member._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</div>
              <div className="pagination-controls">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && <MemberModal member={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </>
  );
}
