import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card, ErrorBox, Loader, PageHeader, StatCard, StateBadge } from '../components/ui';
import Icon from '../components/Icon';
import { useFetch } from '../lib/useFetch';
import { CHART, axisProps, tooltipProps } from '../lib/chartTheme';
import { STATE_META, fmtDateTime, fmtNumber, plural } from '../lib/format';

function toSeries(rows) {
  const byTime = new Map();
  rows.forEach((r) => {
    const key = r.reading_time;
    if (!byTime.has(key)) byTime.set(key, { time: fmtDateTime(key).slice(0, 11) });
    byTime.get(key)[`s${r.device_parameter_id}`] = r.value;
  });
  return [...byTime.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v).slice(-24);
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch('/reports/dashboard');
  const series = useFetch('/reports/readings-series?dp=1,3');

  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (loading && !data) return <Loader />;

  const t = data.totals;
  const stateData = data.byState.map((s) => ({ ...s, name: STATE_META[s.label]?.label || s.label }));
  const lineData = toSeries(series.data || []);

  return (
    <>
      <PageHeader title="Вітаємо вдома" subtitle={`Загальний стан розумного будинку · ${new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}`}>
        <button className="btn btn-ghost" onClick={() => { reload(); series.reload(); }}>
          <Icon name="refresh" size={18} /> Оновити
        </button>
      </PageHeader>

      <div className="stats">
        <StatCard icon="device" label="Пристроїв у системі" value={t.devices}
          hint={`${t.houses} ${plural(t.houses, 'будинок', 'будинки', 'будинків')}, ${t.rooms} ${plural(t.rooms, 'кімната', 'кімнати', 'кімнат')}`} />
        <StatCard icon="power" tone="success" label="Увімкнено зараз" value={t.devices_on}
          hint={`${Math.round((t.devices_on / Math.max(t.devices, 1)) * 100)}% від усіх пристроїв`} />
        <StatCard icon="alert" tone={t.devices_problem ? 'danger' : 'success'} label="Потребують уваги" value={t.devices_problem}
          hint="Стан «Помилка» або «Не в мережі»" />
        <StatCard icon="scenario" tone="info" label="Активних сценаріїв" value={t.scenarios_active}
          hint={`${t.events} ${plural(t.events, 'подія', 'події', 'подій')} у журналі`} />
      </div>

      {data.problems.length > 0 && (
        <div className="alert-strip" role="alert">
          <Icon name="alert" />
          <div>
            <b>Увага:</b>{' '}
            {data.problems.map((p, i) => (
              <span key={p.device_id}>
                {i > 0 && '; '}
                «{p.device_name}» ({p.house_name}, {p.room_name.toLowerCase()}) — {STATE_META[p.current_state].label.toLowerCase()}
              </span>
            ))}
          </div>
          <Link to="/devices?state=PROBLEM" className="btn btn-sm btn-primary">Переглянути</Link>
        </div>
      )}

      <div className="grid-2">
        <Card title="Температура на Оболоні, °C">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="time" {...axisProps} minTickGap={24} />
              <YAxis {...axisProps} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => fmtNumber(v, 0)} />
              <Tooltip {...tooltipProps} formatter={(v) => `${fmtNumber(v, 1)} °C`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="s1" name="Вітальня" stroke={CHART.primary} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="s3" name="Спальня" stroke={CHART.secondary} strokeWidth={2.5} dot={false} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Стан пристроїв">
          <div className="donut-row">
            <ResponsiveContainer width="55%" height={240}>
              <PieChart>
                <Pie data={stateData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={96} paddingAngle={3} cornerRadius={6} stroke="none" isAnimationActive={false}>
                  {stateData.map((s) => <Cell key={s.label} fill={CHART.states[s.label]} />)}
                </Pie>
                <Tooltip {...tooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="legend-list">
              {stateData.map((s) => (
                <li key={s.label}>
                  <span className="legend-dot" style={{ background: CHART.states[s.label] }} />
                  <span>{s.name}</span>
                  <b>{s.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Кількість пристроїв за типами">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byType} layout="vertical" margin={{ top: 0, right: 24, left: 16, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" allowDecimals={false} {...axisProps} />
              <YAxis type="category" dataKey="label" width={130} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v) => [v, 'Пристроїв']} />
              <Bar dataKey="value" fill={CHART.primary} radius={[0, 8, 8, 0]} barSize={14} background={{ fill: '#f2f2f4', radius: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Події за кімнатами">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byRoom.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 24, left: 16, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" allowDecimals={false} {...axisProps} />
              <YAxis type="category" dataKey="label" width={250} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v) => [v, 'Подій']} />
              <Bar dataKey="value" fill={CHART.secondary} radius={[0, 8, 8, 0]} barSize={14} background={{ fill: '#f2f2f4', radius: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Останні показники сенсорів" actions={<Link to="/readings" className="link">Усі показники →</Link>}>
          <ul className="list">
            {data.latest.map((r) => (
              <li key={r.device_parameter_id}>
                <div>
                  <div className="list-title">{r.device_name}</div>
                  <div className="muted small">{r.parameter_name} · {fmtDateTime(r.reading_time)}</div>
                </div>
                <div className="list-value">{fmtNumber(r.value)} <span className="muted">{r.unit}</span></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Останні події" actions={<Link to="/events" className="link">Журнал подій →</Link>}>
          <ul className="list">
            {data.recent.map((e) => (
              <li key={e.event_id}>
                <div>
                  <div className="list-title">{e.description || e.event_type}</div>
                  <div className="muted small">
                    {e.device_name} · {e.house_name}{e.scenario_name ? ` · сценарій «${e.scenario_name}»` : ''}
                  </div>
                </div>
                <div className="muted small nowrap">{fmtDateTime(e.event_time)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {data.problems.length === 0 && <p className="muted">Усі пристрої працюють у штатному режимі <StateBadge state="ON" /></p>}
    </>
  );
}
