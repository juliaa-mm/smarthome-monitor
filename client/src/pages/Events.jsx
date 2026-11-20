import CrudPage from '../components/CrudPage';
import { Badge, StateBadge } from '../components/ui';
import { fmtDateTime } from '../lib/format';
import { deviceOptions, eventTypeOptions, houseOptions, scenarioOptions } from '../lib/options';

const TYPE_TONE = {
  'Увімкнення': 'success', 'Вимкнення': 'neutral', 'Помилка пристрою': 'danger',
  'Втрата підключення': 'warning', 'Перевищення порогу': 'warning', 'Виявлення руху': 'info',
};

const eventColumns = [
  { key: 'event_time', label: 'Час', render: (r) => <span className="nowrap">{fmtDateTime(r.event_time)}</span> },
  { key: 'event_type', label: 'Тип', render: (r) => <Badge tone={TYPE_TONE[r.event_type] || 'neutral'}>{r.event_type}</Badge> },
  { key: 'description', label: 'Опис' },
  { key: 'device_name', label: 'Пристрій', render: (r) => (<><div className="cell-title">{r.device_name}</div><div className="muted small">{r.room_name}, {r.house_name}</div></>) },
  { key: 'scenario_name', label: 'Сценарій', render: (r) => r.scenario_name || <span className="muted">вручну / пристрій</span> },
];

const eventFields = [
  { name: 'device_id', label: 'Пристрій', type: 'select', required: true, wide: true, ...deviceOptions },
  { name: 'event_type_id', label: 'Тип події', type: 'select', required: true, ...eventTypeOptions },
  { name: 'event_time', label: 'Час події', type: 'datetime-local', hint: 'Якщо не вказати — поточний час' },
  { name: 'description', label: 'Опис', type: 'textarea', max: 300, wide: true },
  { name: 'scenario_id', label: 'Сценарій (якщо подію викликав сценарій)', type: 'select', wide: true, ...scenarioOptions },
];

export function Events() {
  return (
    <CrudPage
      title="Журнал подій"
      subtitle="Усі події пристроїв: увімкнення, вимкнення, помилки, виявлення руху, спрацювання сценаріїв"
      endpoint="/events"
      rowKey="event_id"
      columns={eventColumns}
      fields={eventFields}
      filters={[
        { name: 'house_id', label: 'Будинок', ...houseOptions },
        { name: 'event_type_id', label: 'Тип події', ...eventTypeOptions },
        { name: 'scenario_id', label: 'Сценарій', ...scenarioOptions },
      ]}
      searchPlaceholder="Пошук в описі, за пристроєм або кімнатою…"
      labels={{ new: 'Нова подія', acc: 'подію', added: 'Подію додано', deleted: 'Подію видалено' }}
      describe={(r) => `${r.event_type}, ${fmtDateTime(r.event_time)}`}
      toForm={(r) => ({ ...r, event_time: r.event_time?.replace(' ', 'T').slice(0, 16) })}
    />
  );
}

const historyColumns = [
  { key: 'changed_at', label: 'Час зміни', render: (r) => <span className="nowrap">{fmtDateTime(r.changed_at)}</span> },
  { key: 'device_name', label: 'Пристрій', render: (r) => (<><div className="cell-title">{r.device_name}</div><div className="muted small">{r.room_name}, {r.house_name}</div></>) },
  {
    key: 'old_state', label: 'Зміна стану', sortable: false,
    render: (r) => <span className="nowrap"><StateBadge state={r.old_state} /> <span className="arrow">→</span> <StateBadge state={r.new_state} /></span>,
  },
];

export function History() {
  return (
    <CrudPage
      title="Історія станів"
      subtitle="Хронологія змін станів пристроїв. Записи додаються автоматично під час зміни стану або виконання сценарію"
      endpoint="/history"
      rowKey="history_id"
      columns={historyColumns}
      filters={[{ name: 'device_id', label: 'Пристрій', ...deviceOptions }]}
      searchPlaceholder="Пошук за пристроєм, кімнатою, будинком…"
      canDelete={false}
    />
  );
}
