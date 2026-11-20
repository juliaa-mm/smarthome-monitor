import { useMemo, useState } from 'react';
import { Empty } from './ui';

const PAGE_SIZE = 10;

export default function DataTable({ columns, rows, rowKey, actions, pageSize = PAGE_SIZE, initialSort }) {
  const [sort, setSort] = useState(initialSort || null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue || ((r) => r[sort.key]);
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'uk', { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  if (!rows.length) return <Empty />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`${c.align === 'right' ? 'ta-right' : ''} ${c.sortable === false ? '' : 'sortable'}`}
                style={c.width ? { width: c.width } : undefined}
                onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
                aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {c.label}
                {sort?.key === c.key && <span className="sort-mark">{sort.dir === 'asc' ? '▲' : '▼'}</span>}
              </th>
            ))}
            {actions && <th className="ta-right" style={{ width: 1 }}>Дії</th>}
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} className={c.align === 'right' ? 'ta-right num' : ''}>
                  {c.render ? c.render(r) : (r[c.key] ?? '—')}
                </td>
              ))}
              {actions && <td className="ta-right nowrap">{actions(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <span className="muted">
          {pages > 1
            ? `Показано ${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, sorted.length)} з ${sorted.length}`
            : `Усього: ${sorted.length}`}
        </span>
        {pages > 1 && (
          <div className="pager">
            <button className="btn btn-ghost btn-sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
              ← Назад
            </button>
            <span className="muted">Сторінка {current} з {pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
              Далі →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
