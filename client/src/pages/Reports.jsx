import Tabs from '../components/Tabs';
import DataTable from '../components/DataTable';
import { Card, ErrorBox, Loader, PageHeader, StateBadge } from '../components/ui';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { MODE_META, fmtDateTime, fmtNumber } from '../lib/format';

function Report({ url, columns, rowKey, note, pageSize = 15 }) {
  const { data, loading, error, reload } = useFetch(url);
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (loading && !data) return <Loader />;
  const rows = data.map((r, i) => ({ __k: i, ...r }));
  return (
    <Card>
      {note && <p className="muted report-note">{note}</p>}
      <DataTable columns={columns} rows={rows} rowKey={rowKey || '__k'} pageSize={pageSize} />
    </Card>
  );
}

function exportCsv(url, filename) {
  api.get(url).then((rows) => {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    a.click();
  });
}

const tabs = [
  {
    id: 'room-states', label: 'Стан по кімнатах', url: '/reports/room-states',
    note: 'Поточний стан кожного пристрою по будинках і кімнатах та коли він востаннє змінювався.',
    columns: [
      { key: 'house_name', label: 'Будинок' },
      { key: 'room_name', label: 'Кімната' },
      { key: 'floor', label: 'Поверх', align: 'right' },
      { key: 'device_name', label: 'Пристрій', render: (r) => <span className="cell-title">{r.device_name}</span> },
      { key: 'device_type', label: 'Тип' },
      { key: 'current_state', label: 'Стан', render: (r) => <StateBadge state={r.current_state} /> },
      { key: 'work_mode', label: 'Режим', render: (r) => MODE_META[r.work_mode] },
      { key: 'last_change', label: 'Остання зміна', render: (r) => fmtDateTime(r.last_change) },
    ],
  },
  {
    id: 'room-summary', label: 'Підсумок по кімнатах', url: '/reports/room-summary',
    note: 'Скільки пристроїв у кожній кімнаті увімкнено, вимкнено і скільки потребують уваги.',
    columns: [
      { key: 'house_name', label: 'Будинок' },
      { key: 'room_name', label: 'Кімната' },
      { key: 'devices_total', label: 'Усього', align: 'right' },
      { key: 'on_count', label: 'Увімкнено', align: 'right' },
      { key: 'off_count', label: 'Вимкнено', align: 'right' },
      { key: 'problem_count', label: 'Проблемні', align: 'right', render: (r) => (r.problem_count ? <b className="text-danger">{r.problem_count}</b> : 0) },
    ],
  },
  {
    id: 'top-devices', label: 'Найактивніші пристрої', url: '/reports/top-devices',
    note: 'Які пристрої спрацьовували найчастіше.',
    columns: [
      { key: 'place', label: 'Місце', align: 'right', width: 70 },
      { key: 'device_name', label: 'Пристрій', render: (r) => <span className="cell-title">{r.device_name}</span> },
      { key: 'room_name', label: 'Кімната' },
      { key: 'house_name', label: 'Будинок' },
      { key: 'events_count', label: 'Подій', align: 'right' },
    ],
  },
  {
    id: 'scenario-rooms', label: 'Спрацювання сценаріїв', url: '/reports/scenario-rooms',
    note: 'У яких кімнатах найчастіше спрацьовували сценарії автоматизації.',
    columns: [
      { key: 'house_name', label: 'Будинок' },
      { key: 'room_name', label: 'Кімната' },
      { key: 'scenario_events', label: 'Спрацювань', align: 'right' },
      { key: 'scenarios_count', label: 'Різних сценаріїв', align: 'right' },
      { key: 'first_run', label: 'Перше', render: (r) => fmtDateTime(r.first_run) },
      { key: 'last_run', label: 'Останнє', render: (r) => fmtDateTime(r.last_run) },
    ],
  },
  {
    id: 'latest', label: 'Останні показники', url: '/reports/latest-readings',
    note: 'Останнє виміряне значення кожного датчика.',
    columns: [
      { key: 'house_name', label: 'Будинок' },
      { key: 'device_name', label: 'Сенсор', render: (r) => <span className="cell-title">{r.device_name}</span> },
      { key: 'parameter_name', label: 'Параметр' },
      { key: 'value', label: 'Значення', align: 'right', render: (r) => `${fmtNumber(r.value, 1)} ${r.unit}` },
      { key: 'reading_time', label: 'Час', render: (r) => fmtDateTime(r.reading_time) },
    ],
  },
  {
    id: 'counts', label: 'Записи в таблицях', url: '/reports/table-counts',
    note: 'Скільки записів зберігається в кожному розділі системи.',
    columns: [
      { key: 'table_name', label: 'Таблиця', render: (r) => <code>{r.table_name}</code> },
      { key: 'rows_count', label: 'Записів', align: 'right' },
    ],
  },
];

export default function Reports() {
  return (
    <>
      <PageHeader title="Звіти" subtitle="Аналітичні вибірки з бази даних. Звіт можна вивантажити у CSV для Excel" />
      <Tabs tabs={tabs.map((t) => ({
        id: t.id,
        label: t.label,
        render: () => (
          <>
            <div className="toolbar toolbar-end">
              <button className="btn btn-ghost btn-sm" onClick={() => exportCsv(t.url, `${t.id}.csv`)}>
                Вивантажити CSV
              </button>
            </div>
            <Report key={t.id} url={t.url} columns={t.columns} note={t.note} />
          </>
        ),
      }))} />
    </>
  );
}
