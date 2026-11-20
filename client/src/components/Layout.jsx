import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Icon from './Icon';

const NAV = [
  { group: 'Огляд', items: [
    { to: '/', label: 'Головна', icon: 'dashboard', end: true },
  ] },
  { group: 'Моніторинг', items: [
    { to: '/devices', label: 'Пристрої', icon: 'device' },
    { to: '/readings', label: 'Показники сенсорів', icon: 'sensor' },
    { to: '/events', label: 'Журнал подій', icon: 'events' },
    { to: '/history', label: 'Історія станів', icon: 'history' },
  ] },
  { group: 'Керування', items: [
    { to: '/scenarios', label: 'Сценарії', icon: 'scenario' },
    { to: '/houses', label: 'Будинки і кімнати', icon: 'home' },
    { to: '/directories', label: 'Довідники', icon: 'book' },
  ] },
  { group: 'Аналітика', items: [
    { to: '/reports', label: 'Звіти', icon: 'report' },
  ] },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-inner glass">
          <div className="brand">
            <div className="brand-logo"><Icon name="home" size={20} /></div>
            <div>
              <div className="brand-name">SmartHome</div>
              <div className="brand-sub">Monitor</div>
            </div>
          </div>

          <nav aria-label="Головне меню">
            {NAV.map((g) => (
              <div key={g.group} className="nav-group">
                <div className="nav-group-title">{g.group}</div>
                {g.items.map((i) => (
                  <NavLink key={i.to} to={i.to} end={i.end} className="nav-link">
                    <span className="nav-icon"><Icon name={i.icon} size={18} /></span>
                    <span>{i.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="user-box">
            <div className="user-avatar"><Icon name="user" size={18} /></div>
            <div className="user-meta">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{isAdmin ? 'Адміністратор' : 'Перегляд'}</div>
            </div>
            <button className="icon-btn" onClick={logout} title="Вийти із системи" aria-label="Вийти із системи">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <main className="content">
          {!isAdmin && (
            <div className="readonly-note">
              <Icon name="user" size={16} /> Режим перегляду: змінювати дані може лише адміністратор
            </div>
          )}
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
