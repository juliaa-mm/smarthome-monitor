import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function Chevron() {
  return (
    <svg className="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  );
}

export default function Select({
  value, onChange, options, placeholder = 'Оберіть…', emptyLabel, id, ariaLabel, invalid, size = 'md', className = '', searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const [query, setQuery] = useState('');
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  const all = emptyLabel !== undefined ? [{ value: '', label: emptyLabel }, ...options] : options;
  const q = query.trim().toLowerCase();
  const items = q
    ? all.filter((o) => [o.label, o.hint, o.group].some((t) => t && String(t).toLowerCase().includes(q)))
    : all;
  const current = all.find((o) => String(o.value) === String(value ?? ''));
  const shown = current && !(current.value === '' && emptyLabel === undefined)
    ? (current.hint ? `${current.label} · ${current.hint}` : current.label) : null;

  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const maxH = 300;
    const below = window.innerHeight - r.bottom - 12;
    const up = below < Math.min(maxH, all.length * 40 + 16) && r.top > below;
    setPos({
      left: r.left,
      width: Math.max(r.width, searchable ? 320 : 280),
      top: up ? undefined : r.bottom + 6,
      bottom: up ? window.innerHeight - r.top + 6 : undefined,
      maxHeight: Math.min(maxH, (up ? r.top : below) - 12),
      up,
    });
  }, [all.length, searchable]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 140);
  }, []);

  const openList = () => {
    setQuery('');
    place();
    setActive(Math.max(0, all.findIndex((o) => String(o.value) === String(value ?? ''))));
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    const onScroll = (e) => {
      if (listRef.current && listRef.current.contains(e.target)) return;
      place();
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const choose = (opt) => {
    onChange(opt.value);
    close();
    btnRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1); }
    else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) { e.preventDefault(); if (items[active]) choose(items[active]); }
    else if (e.key === 'Tab') close();
    else if (e.key.length === 1 && !searchable) {
      const ch = e.key.toLowerCase();
      const start = active + 1;
      const order = [...items.slice(start), ...items.slice(0, start)];
      const hit = order.find((o) => String(o.label).toLowerCase().startsWith(ch));
      if (hit) setActive(items.indexOf(hit));
    }
  };

  return (
    <>
      <button
        type="button"
        id={id}
        ref={btnRef}
        className={`select select-${size} ${open && !closing ? 'select-open' : ''} ${invalid ? 'input-error' : ''} ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={`select-value ${shown ? '' : 'select-placeholder'}`}>{shown ?? placeholder}</span>
        <Chevron />
      </button>
      {open && pos && createPortal(
        <ul
          ref={listRef}
          role="listbox"
          className={`select-menu ${pos.up ? 'select-menu-up' : ''} ${closing ? 'select-menu-closing' : ''}`}
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
        >
          {searchable && (
            <li className="select-search">
              <input
                ref={searchRef}
                className="input"
                type="text"
                placeholder="Пошук…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                aria-label="Пошук у списку"
              />
            </li>
          )}
          {items.map((o, i) => {
            const selected = String(o.value) === String(value ?? '');
            const header = o.group && o.group !== items[i - 1]?.group;
            return (
              <Fragment key={`${o.value}`}>
              {header && <li className="select-group" role="presentation">{o.group}</li>}
              <li
                role="option"
                data-index={i}
                aria-selected={selected}
                className={`select-option ${i === active ? 'active' : ''} ${selected ? 'selected' : ''} ${o.value === '' ? 'select-option-empty' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                <span className="select-option-text">
                  <span>{o.label}</span>
                  {o.hint && <small>{o.hint}</small>}
                </span>
                {selected && <Check />}
              </li>
              </Fragment>
            );
          })}
          {!items.length && <li className="select-option select-option-empty">{q ? 'Нічого не знайдено' : 'Немає варіантів'}</li>}
        </ul>,
        document.body
      )}
    </>
  );
}
