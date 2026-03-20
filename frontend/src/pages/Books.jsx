import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBooks, addBook, updateBook, deleteBook } from '../api/axios';

const EMPTY_FORM = { title: '', author: '', isbn: '', genre: '', publishedYear: '', totalCopies: 1, description: '' };

export default function Books() {
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const fetchBooks = (q = '') => {
    setLoading(true);
    getBooks(q)
      .then(r => setBooks(r.data))
      .catch(() => toast.error('Failed to load books'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooks(); }, []);

  const openAdd  = () => { setEditBook(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (b) => {
    setEditBook(b);
    setForm({
      title: b.title, author: b.author, isbn: b.isbn || '',
      genre: b.genre || '', publishedYear: b.publishedYear || '',
      totalCopies: b.totalCopies, description: b.description || ''
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditBook(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, totalCopies: Number(form.totalCopies), publishedYear: form.publishedYear ? Number(form.publishedYear) : null };
      if (editBook) { await updateBook(editBook.id, payload); toast.success('Book updated!'); }
      else          { await addBook(payload);                  toast.success('Book added!');   }
      closeModal();
      fetchBooks(search);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await deleteBook(id); toast.success('Book deleted'); fetchBooks(search); }
    catch (err) { toast.error(err.message); }
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.length === 0 || v.length >= 2) fetchBooks(v);
  };

  const statusBadge = (status) => (
    <span className={`badge ${status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>{status}</span>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Books</h1>
        <p>Manage your library book catalog</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Book Catalog <span className="text-muted">({books.length})</span></span>
          <div className="gap-actions">
            <div className="search-bar">
              <Search size={15} />
              <input placeholder="Search books…" value={search} onChange={handleSearch} />
            </div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15} />Add Book</button>
          </div>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner"/></div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} />
            <p>No books found</p>
            <small>{search ? 'Try a different search' : 'Add your first book to get started'}</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Title</th><th>Author</th><th>ISBN</th>
                  <th>Genre</th><th>Copies</th><th>Available</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td><strong>{b.title}</strong></td>
                    <td>{b.author}</td>
                    <td>{b.isbn || '—'}</td>
                    <td>{b.genre || '—'}</td>
                    <td>{b.totalCopies}</td>
                    <td>{b.availableCopies}</td>
                    <td>{statusBadge(b.status)}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(b)}><Pencil size={13}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id, b.title)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Title *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Book title" />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input required value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Author name" />
                </div>
                <div className="form-group">
                  <label>ISBN</label>
                  <input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} placeholder="e.g. 978-0-06-112008-4" />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} placeholder="e.g. Fiction, Science" />
                </div>
                <div className="form-group">
                  <label>Published Year</label>
                  <input type="number" value={form.publishedYear} onChange={e => setForm({...form, publishedYear: e.target.value})} placeholder="e.g. 2023" min={1000} max={2099} />
                </div>
                <div className="form-group">
                  <label>Total Copies *</label>
                  <input type="number" required min={1} value={form.totalCopies} onChange={e => setForm({...form, totalCopies: e.target.value})} />
                </div>
                <div className="form-group span-2">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional book description…" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
