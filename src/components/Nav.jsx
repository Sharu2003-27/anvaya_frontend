import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Nav.css';

export default function Nav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>Anvaya CRM</h1>
        </Link>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/leads" className={isActive('/leads') ? 'active' : ''}>
              Leads
            </Link>
          </li>
          <li>
            <Link to="/leads/status" className={isActive('/leads/status') ? 'active' : ''}>
              By Status
            </Link>
          </li>
          <li>
            <Link to="/leads/agents" className={isActive('/leads/agents') ? 'active' : ''}>
              By Agent
            </Link>
          </li>
          <li>
            <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>
              Reports
            </Link>
          </li>
          <li>
            <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
