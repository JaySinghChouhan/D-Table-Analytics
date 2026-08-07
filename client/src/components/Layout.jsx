import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { apiSlice } from '../app/apiSlice';

export default function Layout({ children, links }) {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('nav-open');

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('nav-open');
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate('/login');
  };

  return (
    <div className={`app-shell${menuOpen ? ' menu-open' : ''}`}>
      <button
        type="button"
        className="nav-backdrop"
        aria-label="Close menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <aside className="sidebar" id="app-sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">A</span>
            <div>
              <strong>Attendify</strong>
              <p>Attendance System</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn sidebar-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="side-nav" onClick={() => setMenuOpen(false)}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            <span className="badge">{user?.role}</span>
          </div>
          <button type="button" className="btn btn-ghost logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => setMenuOpen(true)}
          >
            <span className="hamburger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div className="topbar-copy">
            <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="muted">Track, verify, and manage attendance in one place.</p>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
