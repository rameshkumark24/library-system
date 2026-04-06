import { useEffect, useState } from 'react';
import { Plus, RotateCcw, BookMarked, Search, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBorrows, getOverdueBorrows, issueBook, returnBook, getBooks, getMembers } from '../api/axios';

export default function Borrows() {
  const [borrows, setBorrows]     = useState([]);
  const [books, setBooks]         = useState([]);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ bookId: '', memberId: '', days: 14 });

  const fetchBorrows = (f = filter) => {
    setLoading(true);
    const p = f === 'ALL' ? {} : f === 'OVERDUE' ? null : { status: f };
    const call = f === 'OVERDUE' ? getOverdueBorrows() : getBorrows(p);
    call
      .then(r => setBorrows(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Failed to load borrows — backend may be offline'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBorrows('ALL');
    getBooks().then(r => setBooks(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    getMembers().then(r => setMembers(Array.isArray(r.data) ? r.data.filter(m => m.status === 'ACTIVE') : [])).catch(() => {});
  }, []);

  const handleFilterChange = (f) => { setFilter(f); fetchBorrows(f); };

  const handleIssue = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await issueBook({ bookId: Number(form.bookId), memberId: Number(form.memberId), days: Number(form.days) });
      toast.success('Book issued successfully!');
      setShowModal(false);
      setForm({ bookId: '', memberId: '', days: 14 });
      fetchBorrows(filter);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleReturn = async (id, title) => {
    if (!window.confirm(`Mark "${title}" as returned?`)) return;
    try {
      await returnBook(id);
      toast.success('Book returned successfully!');
      fetchBorrows(filter);
    } catch (err) { toast.error(err.message); }
  };

  const statusBadge = (status) => {
    const map = { BORROWED: 'badge-warning', RETURNED: 'badge-success', OVERDUE: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const isOverdue = (r) => r.status === 'BORROWED' && new Date(r.dueDate) < new Date();

  const filters = ['ALL', 'BORROWED', 'RETURNED', 'OVERDUE'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Borrows</h1>
        <p>Manage book borrowing and returns</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => handleFilterChange(f)}>
                {f === 'OVERDUE' && <AlertTriangle size={12}/>}
                {f}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15}/> Issue Book
          </button>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner"/></div>
        ) : borrows.length === 0 ? (
          <div className="empty-state">
            <BookMarked size={40}/>
            <p>No records found</p>
            <small>{filter !== 'ALL' ? `No ${filter.toLowerCase()} borrows` : 'Issue a book to get started'}</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Book</th><th>Member</th><th>Borrow Date</th>
                  <th>Due Date</th><th>Return Date</th><th>Fine (₹)</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((r, i) => (
                  <tr key={r.id} style={isOverdue(r) ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                    <td>{i + 1}</td>
                    <td><strong>{r.book?.title}</strong></td>
                    <td>{r.member?.name}</td>
                    <td>{formatDate(r.borrowDate)}</td>
                    <td style={isOverdue(r) ? { color: 'var(--danger)' } : {}}>{formatDate(r.dueDate)}</td>
                    <td>{formatDate(r.returnDate)}</td>
                    <td style={r.fine > 0 ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
                      {r.fine > 0 ? `₹${r.fine}` : '—'}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td>
                      {r.status === 'BORROWED' || r.status === 'OVERDUE' ? (
                        <button className="btn btn-success btn-sm" onClick={() => handleReturn(r.id, r.book?.title)}>
                          <RotateCcw size={13}/> Return
                        </button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Issue Book</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleIssue}>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Select Book *</label>
                  <select required value={form.bookId} onChange={e => setForm({...form, bookId: e.target.value})}>
                    <option value="">— Choose a book —</option>
                    {books.filter(b => b.availableCopies > 0).map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group span-2">
                  <label>Select Member *</label>
                  <select required value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}>
                    <option value="">— Choose a member —</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group span-2">
                  <label>Borrow Duration (days)</label>
                  <input type="number" min={1} max={90} value={form.days}
                    onChange={e => setForm({...form, days: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Issuing…' : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
