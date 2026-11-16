import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function SearchDropdown({ label, placeholder, searchUrl, displayKey, subKey, onSelect, selected }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await axios.get(searchUrl, { params: { search: val, limit: 6 } });
      const data = res.data.books || res.data.members || [];
      setResults(data);
      setOpen(true);
    } catch { } finally { setLoading(false); }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item[displayKey]);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          placeholder={placeholder}
          value={selected ? query : query}
          onChange={e => { if (selected) handleClear(); handleSearch(e.target.value); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          style={{ paddingRight: selected ? 36 : 14 }}
        />
        {selected && (
          <button onClick={handleClear} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {results.map(item => (
            <button key={item._id} onClick={() => handleSelect(item)} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)', transition: 'background 0.15s', display: 'flex', flexDirection: 'column', gap: 2 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item[displayKey]}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item[subKey]}</span>
            </button>
          ))}
        </div>
      )}
      {loading && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /></div>}
    </div>
  );
}

export default function IssueBook() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleIssue = async () => {
    if (!selectedBook) return toast.error('Please select a book');
    if (!selectedMember) return toast.error('Please select a member');
    if (!dueDate) return toast.error('Please set a due date');
    setLoading(true);
    try {
      await axios.post('/api/transactions/issue', {
        bookId: selectedBook._id,
        memberId: selectedMember._id,
        dueDate,
        notes
      });
      toast.success(`"${selectedBook.title}" issued to ${selectedMember.name}`);
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally { setLoading(false); }
  };

  const maxBooks = selectedMember ? (selectedMember.membershipType === 'Premium' ? 5 : selectedMember.membershipType === 'Standard' ? 3 : 2) : null;

  return (
    <>
      <div className="page-header">
        <h1>Issue Book</h1>
        <p>Check out a book to a library member</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Main form */}
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Book Issue Form</h3>

            <div style={{ display: 'grid', gap: 20 }}>
              <SearchDropdown
                label="Select Book *"
                placeholder="Search by title, author or ISBN..."
                searchUrl="/api/books"
                displayKey="title"
                subKey="author"
                selected={selectedBook}
                onSelect={setSelectedBook}
              />

              {selectedBook && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="book-cover" style={{ width: 44, height: 58 }}>📖</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedBook.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{selectedBook.author}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-gray" style={{ fontSize: 11 }}>ISBN: {selectedBook.isbn}</span>
                      <span className={`badge ${selectedBook.availableCopies > 0 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                        {selectedBook.availableCopies} of {selectedBook.totalCopies} available
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: 11 }}>{selectedBook.category}</span>
                    </div>
                    {selectedBook.availableCopies === 0 && (
                      <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>⚠ No copies available for issue</div>
                    )}
                  </div>
                </div>
              )}

              <SearchDropdown
                label="Select Member *"
                placeholder="Search by name, email or member ID..."
                searchUrl="/api/members"
                displayKey="name"
                subKey="email"
                selected={selectedMember}
                onSelect={setSelectedMember}
              />

              {selectedMember && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div className="user-avatar">{selectedMember.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedMember.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedMember.memberId}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TYPE</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{selectedMember.membershipType}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CHECKED OUT</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: selectedMember.booksCheckedOut >= maxBooks ? 'var(--red)' : 'var(--text-primary)' }}>
                        {selectedMember.booksCheckedOut}/{maxBooks}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>STATUS</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: selectedMember.status === 'Active' ? 'var(--green)' : 'var(--red)' }}>
                        {selectedMember.status}
                      </div>
                    </div>
                  </div>
                  {selectedMember.booksCheckedOut >= maxBooks && (
                    <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>⚠ Member has reached maximum book limit</div>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Due Date *</label>
                  <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Quick Set</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[7, 14, 30].map(days => {
                      const d = new Date(); d.setDate(d.getDate() + days);
                      const val = d.toISOString().split('T')[0];
                      return (
                        <button key={days} type="button" className={`btn btn-ghost btn-sm`} style={{ flex: 1, justifyContent: 'center', ...(dueDate === val ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) }} onClick={() => setDueDate(val)}>
                          {days}d
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special notes..." style={{ minHeight: 64 }} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h3 style={{ fontSize: 14, marginBottom: 16, color: 'var(--text-secondary)' }}>Issue Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Book', value: selectedBook?.title || '—' },
                  { label: 'Member', value: selectedMember?.name || '—' },
                  { label: 'Issue Date', value: new Date().toLocaleDateString('en-IN') },
                  { label: 'Due Date', value: dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '—' },
                  { label: 'Duration', value: dueDate ? `${Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days` : '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', wordBreak: 'break-word', maxWidth: 160 }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Fine Policy: ₹5/day after due date</div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleIssue} disabled={loading || !selectedBook || !selectedMember || !dueDate}>
                {loading ? 'Processing...' : '📤 Issue Book'}
              </button>
            </div>

            <div className="card" style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}>
              <h4 style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 10 }}>Membership Limits</h4>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>📗 <strong>Student:</strong> 2 books max</div>
                <div>📘 <strong>Standard:</strong> 3 books max</div>
                <div>📙 <strong>Premium:</strong> 5 books max</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
