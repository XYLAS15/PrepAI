import { useEffect, useState, useRef } from 'react';
import { Bell, Sun, Moon, Check, BellOff, Loader, Sparkles } from 'lucide-react';
import { notificationApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Notification } from '../../types';

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  // Fetch unread count initially and poll
  const fetchUnread = async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all notifications when dropdown opens
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      fetchUnread();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
             date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-greeting">
          Welcome back, {user?.fullName?.split(' ')[0]} <Sparkles className="sparkle-icon animate-pulse" size={18} />
        </h2>
      </div>

      <div className="topbar-right" ref={dropdownRef}>
        {/* Theme Toggle Button */}
        <button 
          className="theme-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="icon-sun animate-spin-slow" size={20} />
          ) : (
            <Moon className="icon-moon" size={20} />
          )}
        </button>

        {/* Notifications Popover Button */}
        <button 
          className={`notification-btn ${isOpen ? 'active' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
          title="Notifications"
        >
          <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
          {unreadCount > 0 && (
            <span className="notification-badge pulse-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {isOpen && (
          <div className="notifications-dropdown animate-scale-in">
            <div className="dropdown-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>

            <div className="dropdown-content">
              {loading ? (
                <div className="loading-dropdown">
                  <Loader className="spinner" size={24} />
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-dropdown">
                  <BellOff size={32} className="empty-icon" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`notification-item ${n.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-details">
                        <div className="notification-title-row">
                          <span className="item-title">{n.title}</span>
                          {!n.read && (
                            <button 
                              className="mark-read-item-btn" 
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        <p className="item-message">{n.message}</p>
                        <span className="item-time">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          className="user-avatar" 
          onClick={() => { setIsProfileOpen(!isProfileOpen); setIsOpen(false); }}
          title={user?.fullName}
          style={{ border: 'none', font: 'inherit', cursor: 'pointer' }}
        >
          {initials}
        </button>

        {isProfileOpen && (
          <div className="profile-dropdown animate-scale-in">
            <div className="profile-dropdown-user">
              <span className="profile-dropdown-name">{user?.fullName}</span>
              <span className="profile-dropdown-email">{user?.email}</span>
            </div>
            <button className="profile-dropdown-btn" onClick={logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
