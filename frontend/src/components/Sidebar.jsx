import { NavLink } from 'react-router-dom';
import {
  BookOpen, Users, BookMarked, LayoutDashboard, Library
} from 'lucide-react';

const navItems = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/books',   icon: BookOpen,        label: 'Books'      },
  { to: '/members', icon: Users,           label: 'Members'    },
  { to: '/borrows', icon: BookMarked,      label: 'Borrows'    },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Library size={18} />
        </div>
        <div>
          <h2>LibraSystem</h2>
          <span>Library Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        © 2026 LibraSystem
      </div>
    </aside>
  );
}
