import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      setError('Введіть логін і пароль');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(form.login.trim(), form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="brand-logo brand-logo-lg"><Icon name="home" size={30} /></div>
          <h1>SmartHome Monitor</h1>
          <p>Веб-система моніторингу домашніх IoT-пристроїв</p>
        </div>
        <form className="login-form glass" onSubmit={submit} noValidate>
          <h2>Вхід у систему</h2>
          {error && <div className="error-box" role="alert">{error}</div>}
          <div className="form-field">
            <label htmlFor="login">Логін</label>
            <input
              id="login"
              className="input"
              autoComplete="username"
              autoFocus
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Вхід…' : 'Увійти'}
          </button>
          <div className="login-hint">
            <div><b>admin</b> / admin123 — адміністратор</div>
            <div><b>viewer</b> / viewer123 — лише перегляд</div>
          </div>
        </form>
      </div>
    </div>
  );
}
