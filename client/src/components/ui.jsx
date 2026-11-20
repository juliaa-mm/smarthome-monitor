import { useEffect } from 'react';
import Icon from './Icon';
import { STATE_META } from '../lib/format';

export function StateBadge({ state }) {
  const m = STATE_META[state] || { label: state, tone: 'neutral', icon: '•' };
  return (
    <span className={`badge badge-${m.tone}`}>
      <span aria-hidden="true">{m.icon}</span> {m.label}
    </span>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'primary', icon }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      {icon && <div className="stat-icon"><Icon name={icon} size={22} /></div>}
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          {title && <h2>{title}</h2>}
          {actions}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Empty({ text = 'Записів не знайдено' }) {
  return <div className="empty">{text}</div>;
}

export function Loader() {
  return <div className="loader" role="status">Завантаження…</div>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <Icon name="alert" /> <span>{message}</span>
      {onRetry && <button className="btn btn-ghost btn-sm" onClick={onRetry}>Повторити</button>}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: width }}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрити"><Icon name="close" /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmText = 'Видалити', tone = 'danger', onConfirm, onCancel, busy }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width={440}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>Скасувати</button>
          <button className={`btn btn-${tone}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Виконується…' : confirmText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
