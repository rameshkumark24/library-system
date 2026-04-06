import { useEffect, useState } from 'react';
import { BookOpen, Users, BookMarked, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import { getDashboardStats, getBorrows } from '../api/axios';

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    Promise.all([getDashboardStats(), getBorrows({ status: 'BORROWED' })])
      .then(([s, b]) => {
        setStats(s.data);
        setRecent(b.data.slice(0, 5));
      })
      .catch(() => {
        toast.error('Failed to load dashboard — backend may be offline');
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="spinner"/><span>Loading...</span></div>;

  if (error || !stats) return (
    <div className="empty-state" style={{ padding: '80px 20px' }}>
      <AlertTriangle size={48} style={{ opacity: 0.5, marginBottom: 16, color: 'var(--warning)' }} />
      <p>Could not connect to backend</p>
      <small>Make sure the backend server is running and VITE_API_URL is set correctly on Vercel.</small>
      <br />
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  const cards = [
    { title: 'Total Books',      value: stats?.totalBooks,      subtitle: `${stats?.availableBooks} available`,    icon: BookOpen,      color: '#4f7cf6', bgColor: 'rgba(79,124,246,0.12)'  },
    { title: 'Active Members',   value: stats?.activeMembers,   subtitle: `${stats?.totalMembers} total members`,  icon: Users,         color: '#10b981', bgColor: 'rgba(16,185,129,0.12)'  },
    { title: 'Active Borrows',   value: stats?.activeBorrows,   subtitle: `${stats?.totalBorrows} all time`,       icon: BookMarked,    color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)'   },
    { title: 'Overdue Books',    value: stats?.overdueBorrows,  subtitle: 'Needs attention',                        icon: AlertTriangle, color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)'    },
  ];

  const statusBadge = (status) => {
    const map = { BORROWED: 'badge-warning', RETURNED: 'badge-success', OVERDUE: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to LibraSystem — your library at a glance.</p>
      </div>

      <div className="stats-grid">
        {cards.map((c) => <StatCard key={c.title} {...c} />)}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Active Borrows</span>
          <span className="text-muted">{recent.length} records shown</span>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <BookMarked size={40} />
            <p>No active borrows</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.book?.title}</strong></td>
                    <td>{r.member?.name}</td>
                    <td>{formatDate(r.borrowDate)}</td>
                    <td>{formatDate(r.dueDate)}</td>
                    <td>{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
