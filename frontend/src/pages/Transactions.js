import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function ReturnModal({ transaction, onClose, onReturn }) {
  const [finePaid, setFinePaid] = useState(false);
  const [saving, setSaving] = useState(false);

  const fine = transaction?.fineAmount || (() => {
    if (!transaction) return 0;
    const due = new Date(transaction.dueDate);
    const now = new Date();
    if (now > due) {
      const days = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return days * 5;
    }
    return 0;
  })();

  const handleReturn = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`/api/transactions/${transaction._id}/return`, { finePaid });
      onReturn(res.data);
      toast.success('Book returned successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>Return Book</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Returning</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{transaction?.book?.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>by {transaction?.book?.author}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>MEMBER</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{transaction?.member?.name}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DUE DATE</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: new Date() > new Date(transaction?.dueDate) ? 'var(--red)' : 'var(--text-primary)' }}>
                {new Date(transaction?.dueDate).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {fine > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Overdue Fine</span>
                <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 20 }}>₹{fine}</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={finePaid} onChange={e => setFinePaid(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Fine collected from member</span>
              </label>
            </div>
          )}

          {fine === 0 && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ No fine — returned on time</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleReturn} disabled={saving}>{saving ? 'Processing...' : 'Confirm Return'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/transactions', { params: { page, limit: 10, status } });
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleReturn = (updated) => {
    setTransactions(t => t.map(x => x._id === updated._id ? updated : x));
  };

  const updateOverdue = async () => {
    try {
      const res = await axios.put('/api/transactions/update-overdue');
      toast.success(res.data.message);
      fetchTransactions();
    } catch { toast.error('Failed to update'); }
  };

  const statusBadge = s => ({
    Issued: 'badge-blue', Returned: 'badge-green', Overdue: 'badge-red', Lost: 'badge-gray'
  }[s] || 'badge-gray');

  const isOverdue = (t) => t.status === 'Issued' && new Date() > new Date(t.dueDate);

  return (
    <>
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Track book issues and returns</p>
      </div>
      <div className="page-body">
        <div className="filters-row">
          <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Transactions</option>
            <option>Issued</option><option>Returned</option><option>Overdue</option><option>Lost</option>
          </select>
          <button className="btn btn-ghost" onClick={updateOverdue} style={{ marginLeft: 'auto' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Sync Overdue
          </button>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3>Transaction History <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({total})</span></h3>
          </div>

          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <h3>No transactions found</h3>
              <p>Issue a book to create your first transaction</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const overdue = isOverdue(t);
                  const effectiveStatus = overdue ? 'Overdue' : t.status;
                  return (
                    <tr key={t._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.transactionId}</td>
                      <td>
                        <strong>{t.book?.title}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.book?.isbn}</div>
                      </td>
                      <td>
                        <span>{t.member?.name}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.member?.memberId}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{new Date(t.issueDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: 12, color: overdue ? 'var(--red)' : 'var(--text-secondary)' }}>
                        {new Date(t.dueDate).toLocaleDateString('en-IN')}
                        {overdue && <div style={{ fontSize: 10, color: 'var(--red)' }}>OVERDUE</div>}
                      </td>
                      <td>
                        {t.fineAmount > 0
                          ? <span style={{ color: t.finePaid ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                              ₹{t.fineAmount} {t.finePaid ? '✓' : ''}
                            </span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td><span className={`badge ${statusBadge(effectiveStatus)}`}>{effectiveStatus}</span></td>
                      <td>
                        {(t.status === 'Issued' || t.status === 'Overdue') && (
                          <button className="btn btn-success btn-sm" onClick={() => setReturnModal(t)}>Return</button>
                        )}
                        {t.status === 'Returned' && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {new Date(t.returnDate).toLocaleDateString('en-IN')}
                          </span>
                        )}
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

      {returnModal && <ReturnModal transaction={returnModal} onClose={() => setReturnModal(null)} onReturn={handleReturn} />}
    </>
  );
}
