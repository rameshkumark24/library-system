import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMembers, addMember, updateMember, deleteMember } from '../api/axios';

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', status: 'ACTIVE', membershipExpiry: '' };

export default function Members() {
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const fetchMembers = (q = '') => {
    setLoading(true);
    getMembers(q)
      .then(r => setMembers(r.data))
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const openAdd  = () => { setEditMember(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (m) => {
    setEditMember(m);
    setForm({
      name: m.name, email: m.email, phone: m.phone || '',
      address: m.address || '', status: m.status,
      membershipExpiry: m.membershipExpiry || ''
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditMember(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, membershipExpiry: form.membershipExpiry || null };
      if (editMember) { await updateMember(editMember.id, payload); toast.success('Member updated!'); }
      else            { await addMember(payload);                    toast.success('Member added!');   }
      closeModal(); fetchMembers(search);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete member "${name}"?`)) return;
    try { await deleteMember(id); toast.success('Member deleted'); fetchMembers(search); }
    catch (err) { toast.error(err.message); }
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.length === 0 || v.length >= 2) fetchMembers(v);
  };

  const statusBadge = (status) => {
    const map = { ACTIVE: 'badge-success', INACTIVE: 'badge-muted', SUSPENDED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Members</h1>
        <p>Manage library member registrations</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Members <span className="text-muted">({members.length})</span></span>
          <div className="gap-actions">
            <div className="search-bar">
              <Search size={15}/>
              <input placeholder="Search members…" value={search} onChange={handleSearch}/>
            </div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15}/>Add Member</button>
          </div>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner"/></div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <Users size={40}/>
            <p>No members found</p>
            <small>{search ? 'Try a different search' : 'Register your first member'}</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
                  <th>Joined</th><th>Expiry</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td>{m.phone || '—'}</td>
                    <td>{formatDate(m.membershipDate)}</td>
                    <td>{formatDate(m.membershipExpiry)}</td>
                    <td>{statusBadge(m.status)}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}><Pencil size={13}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id, m.name)}><Trash2 size={13}/></button>
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
              <h2>{editMember ? 'Edit Member' : 'Add New Member'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Member name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Membership Expiry</label>
                  <input type="date" value={form.membershipExpiry} onChange={e => setForm({...form, membershipExpiry: e.target.value})} />
                </div>
                <div className="form-group span-2">
                  <label>Address</label>
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Optional address…"/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
