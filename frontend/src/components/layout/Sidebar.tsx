import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, GitCompare,
  Route, MessageSquare, TrendingUp, BookOpen, BarChart3,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'OVERVIEW' },
  { path: '/resumes', icon: FileText, label: 'Resumes', section: 'ANALYSIS' },
  { path: '/job-descriptions', icon: Briefcase, label: 'Job Descriptions', section: 'ANALYSIS' },
  { path: '/skill-gap', icon: GitCompare, label: 'Skill Gap', section: 'ANALYSIS' },
  { path: '/roadmap', icon: Route, label: 'DSA Roadmap', section: 'PREPARATION' },
  { path: '/question-bank', icon: BookOpen, label: 'Question Bank', section: 'PREPARATION' },
  { path: '/interviews', icon: MessageSquare, label: 'Mock Interview', section: 'PREPARATION' },
  { path: '/progress', icon: TrendingUp, label: 'Progress', section: 'PREPARATION' },
  { path: '/ats-score', icon: BarChart3, label: 'ATS Score', section: 'TOOLS' },
];

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
    // Dispatch custom event so Layout can listen
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }));
  }, [collapsed]);

  const sections = ['OVERVIEW', 'ANALYSIS', 'PREPARATION', 'TOOLS'];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <svg className="logo-svg" viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="3" />
            <path d="M16 8L22 14H18V24H14V14H10L16 8Z" fill="url(#logo-grad)" />
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ef4444" />
                <stop offset="1" stopColor="#991b1b" />
              </linearGradient>
            </defs>
          </svg>
          {!collapsed && (
            <span className="sidebar-brand-text" style={{ fontWeight: 800, fontSize: 'var(--font-xl)', letterSpacing: '-0.03em' }}>PrepAI</span>
          )}
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {sections.map((section) => (
        <div className="sidebar-section" key={section}>
          {!collapsed && <div className="sidebar-section-title">{section}</div>}
          <nav className="sidebar-nav">
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  end={item.path === '/dashboard'}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="icon" size={20} />
                  {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
                </NavLink>
              ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}
