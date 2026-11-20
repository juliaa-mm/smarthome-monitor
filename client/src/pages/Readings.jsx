import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CrudPage from '../components/CrudPage';
import Select from '../components/Select';
import { Card, Empty } from '../components/ui';
import { useFetch } from '../lib/useFetch';
import { CHART, axisProps, tooltipProps } from '../lib/chartTheme';
import { fmtDateTime, fmtNumber, unitLabel } from '../lib/format';
import { sensorOptions } from '../lib/options';

const columns = [
  { key: 'reading_time', label: 'Час вимірювання', render: (r) => fmtDateTime(r.reading_time) },
  { key: 'device_name', label: 'Сенсор', render: (r) => (<><div className="cell-title">{r.device_name}</div><div className="muted small">{r.room_name}, {r.house_name}</div></>) },
  { key: 'parameter_name', label: 'Параметр' },
  { key: 'value', label: 'Значення', align: 'right', render: (r) => <b>{fmtNumber(r.value, 1)} {r.unit}</b> },
];

const fields = [
  { name: 'device_parameter_id', label: 'Сенсор і параметр', type: 'select', required: true, wide: true, ...sensorOptions },
  { name: 'value', label: 'Значення', type: 'number', step: '0.1', required: true },
  { name: 'reading_time', label: 'Час вимірювання', type: 'datetime-local', hint: 'Якщо не вказати — поточний час' },
];

function SensorChart() {
  const sensors = useFetch('/device-parameters');
  const [dp, setDp] = useState('1');
  const { data } = useFetch(`/reports/readings-series?dp=${dp}`);
  const all = data || [];
  const lastTime = all.length ? new Date(all.at(-1).reading_time.replace(' ', 'T')) : null;
  const from = lastTime ? lastTime.getTime() - 7 * 24 * 3600 * 1000 : 0;
  const rows = all
    .filter((r) => new Date(r.reading_time.replace(' ', 'T')).getTime() >= from)
    .map((r) => ({ ...r, time: fmtDateTime(r.reading_time) }));
  const unit = rows[0]?.unit || '';
  const values = rows.map((r) => r.value);

  return (
    <Card
      title="Динаміка показника за останні 7 днів"
      actions={
        <Select
          size="sm"
          className="select-sensor"
          searchable
          value={dp}
          onChange={(v) => setDp(String(v))}
          ariaLabel="Сенсор"
          options={(sensors.data || []).map((s) => ({
            value: String(s.device_parameter_id), label: s.device_name, hint: `${s.parameter_name}, ${unitLabel(s.unit)} · ${s.room_name}`, group: s.house_name,
          }))}
        />
      }
    >
      {rows.length < 2 ? <Empty text="Для графіка потрібно щонайменше два вимірювання" /> : (
        <>
          <div className="mini-stats">
            <div><span className="muted small">Останнє</span><b>{fmtNumber(values.at(-1), 1)} {unit}</b></div>
            <div><span className="muted small">Мінімум</span><b>{fmtNumber(Math.min(...values), 1)} {unit}</b></div>
            <div><span className="muted small">Максимум</span><b>{fmtNumber(Math.max(...values), 1)} {unit}</b></div>
            <div><span className="muted small">Середнє</span><b>{fmtNumber(values.reduce((a, b) => a + b, 0) / values.length, 1)} {unit}</b></div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={rows} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d1d1f" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#1d1d1f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="time" {...axisProps} minTickGap={40} tickFormatter={(v) => v.slice(0, 5)} />
              <YAxis {...axisProps} domain={['auto', 'auto']} tickFormatter={(v) => fmtNumber(v, 1)} />
              <Tooltip {...tooltipProps} formatter={(v) => [`${fmtNumber(v, 1)} ${unit}`, 'Значення']} />
              <Area type="monotone" dataKey="value" stroke={CHART.primary} fill="url(#areaFill)" strokeWidth={2.5} dot={rows.length < 15} activeDot={{ r: 5, fill: CHART.primary, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}

export default function Readings() {
  return (
    <CrudPage
        top={<SensorChart />}
        title="Показники сенсорів"
        subtitle="Усі вимірювання температури, вологості, освітленості та інших параметрів"
        endpoint="/readings"
        rowKey="reading_id"
        columns={columns}
        fields={fields}
        filters={[{ name: 'device_parameter_id', label: 'Сенсор', ...sensorOptions }]}
        searchPlaceholder="Пошук за сенсором або параметром…"
        labels={{ new: 'Нове вимірювання', acc: 'вимірювання', added: 'Вимірювання додано', deleted: 'Вимірювання видалено' }}
        describe={(r) => `${r.device_name}, ${fmtDateTime(r.reading_time)}`}
        toForm={(r) => ({ ...r, reading_time: r.reading_time?.replace(' ', 'T').slice(0, 16) })}
      />
  );
}
