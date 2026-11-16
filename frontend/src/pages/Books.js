import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fiction','Non-Fiction','Science','Technology','History','Biography','Children','Romance','Mystery','Self-Help','Other'];

function BookModal({ book, onClose, onSave }) {
  const isEdit = !!book?._id;
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', category: 'Fiction', publisher: '',
    publishedYear: '', totalCopies: 1, description: '', language: 'English',
    pages: '', location: { shelf: '', row: '' },
    ...(book || {})
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.isbn || !form.category) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/books/${book._id}`, form);
        onSave(res.data, 'update');
        toast.success('Book updated');
      } else {
        const res = await axios.post('/api/books', form);
        onSave(res.data, 'add');
        toast.success('Book added');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Book title" />
              </div>
              <div className="form-group">
                <label className="form-label">Author *</label>
                <input className="form-input" value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ISBN *</label>
                <input className="form-input" value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-..." />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Publisher</label>
                <input className="form-input" value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="Publisher name" />
              </div>
              <div className="form-group">
                <label className="form-label">Published Year</label>
                <input className="form-input" type="number" value={form.publishedYear} onChange={e => set('publishedYear', e.target.value)} placeholder="2024" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Copies</label>
                <input className="form-input" type="number" min="1" value={form.totalCopies} onChange={e => set('totalCopies', parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Pages</label>
                <input className="form-input" type="number" value={form.pages} onChange={e => set('pages', e.target.value)} placeholder="Number of pages" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Shelf</label>
                <input className="form-input" value={form.location?.shelf || ''} onChange={e => set('location', { ...form.location, shelf: e.target.value })} placeholder="A1" />
              </div>
              <div className="form-group">
                <label className="form-label">Row</label>
                <input className="form-input" value={form.location?.row || ''} onChange={e => set('location', { ...form.location, row: e.target.value })} placeholder="R3" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Books() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | book object

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, category, available };
      const res = await axios.get('/api/books', { params });
      setBooks(res.data.books);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [page, search, category, available]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSave = (book, type) => {
    if (type === 'add') setBooks(b => [book, ...b]);
    else setBooks(b => b.map(x => x._id === book._id ? book : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await axios.delete(`/api/books/${id}`);
      setBooks(b => b.filter(x => x._id !== id));
      toast.success('Book deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const categoryBadge = (cat) => {
    const map = { Fiction: 'badge-gold', Technology: 'badge-blue', Science: 'badge-green', History: 'badge-purple', Biography: 'badge-orange' };
    return map[cat] || 'badge-gray';
  };

  return (
    <>
      <div className="page-header">
        <h1>Books</h1>
        <p>Manage your library collection</p>
      </div>
      <div className="page-body">
        <div className="filters-row">
          <div className="search-bar">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by title, author, ISBN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="filter-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={available} onChange={e => { setAvailable(e.target.value); setPage(1); }}>
            <option value="">All Books</option>
            <option value="true">Available Only</option>
          </select>
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setModal('add')}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Book
          </button>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3>All Books <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({total})</span></h3>
          </div>

          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <h3>No books found</h3>
              <p>Add your first book to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="book-cover">📖</div>
                        <div>
                          <strong>{book.title}</strong>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{book.author} {book.publishedYear ? `· ${book.publishedYear}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn}</td>
                    <td><span className={`badge ${categoryBadge(book.category)}`}>{book.category}</span></td>
                    <td>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{book.availableCopies}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/{book.totalCopies}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {book.location?.shelf ? `Shelf ${book.location.shelf}${book.location.row ? `, Row ${book.location.row}` : ''}` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${book.availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>
                        {book.availableCopies > 0 ? 'Available' : 'All Issued'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(book)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {modal && <BookModal book={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </>
  );
}
