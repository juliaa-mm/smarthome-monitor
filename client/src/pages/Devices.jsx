import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CrudPage from '../components/CrudPage';
import Icon from '../components/Icon';
import { Modal, StateBadge } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { MODE_META, MODE_OPTIONS, STATE_META, STATE_OPTIONS, fmtDate, fmtDateTime } from '../lib/format';
import { houseOptions, roomOptions, typeOptions } from '../lib/options';

const columns = [
  { key: 'device_id', label: '№', width: 56, align: 'right' },
  {
    key: 'name', label: 'Пристрій',
    render: (r) => (<><div className="cell-title">{r.name}</div><div className="muted small">{r.type_name}{r.manufacturer ? ` · ${r.manufacturer}` : ''}</div></>),
  },
  {
    key: 'house_name', label: 'Розташування',
    render: (r) => (<><div className="nowrap">{r.room_name}</div><div className="muted small nowrap">{r.house_name}</div></>),
  },
  {
    key: 'current_state', label: 'Стан',
    render: (r) => (
      <>
        <StateBadge state={r.current_state} />
        {r.problem_reason && (
          <div className="problem-reason">{r.problem_reason} · {fmtDateTime(r.problem_time)}</div>
        )}
      </>
    ),
  },
  { key: 'work_mode', label: 'Режим', render: (r) => MODE_META[r.work_mode] },
  { key: 'serial_number', label: 'Серійний номер', render: (r) => <code>{r.serial_number}</code> },
  { key: 'install_date', label: 'Встановлено', render: (r) => fmtDate(r.install_date) },
];

const fields = [
  { name: 'name', label: 'Назва пристрою', required: true, max: 150, wide: true, placeholder: 'Наприклад: Лампа кухні' },
  { name: 'type_id', label: 'Тип пристрою', type: 'select', required: true, ...typeOptions },
  { name: 'room_id', label: 'Кімната', type: 'select', required: true, ...roomOptions },
  { name: 'manufacturer', label: 'Виробник', max: 100 },
  {
    name: 'serial_number', label: 'Серійний номер', required: true, max: 50,
    hint: 'Зазвичай вказаний на пристрої або коробці. Згенеровано автоматично — можна замінити', placeholder: 'PH-1005',
  },
  { name: 'install_date', label: 'Дата встановлення', type: 'date', hint: 'Якщо не вказати — сьогоднішня дата' },
  { name: 'work_mode', label: 'Режим роботи', type: 'select', options: MODE_OPTIONS, hint: 'За замовчуванням — ручний' },
];

const filters = [
  { name: 'house_id', label: 'Будинок', ...houseOptions },
  { name: 'type_id', label: 'Тип', ...typeOptions },
  { name: 'current_state', label: 'Стан', options: [...STATE_OPTIONS, { value: 'PROBLEM', label: 'Потребують уваги' }] },
  { name: 'work_mode', label: 'Режим', options: MODE_OPTIONS },
];

function StateDialog({ device, onClose, onDone }) {
  const notify = useToast();
  const [state, setState] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const apply = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await api.post(`/devices/${device.device_id}/state`, { new_state: state });
      notify(`«${r.device_name}»: ${STATE_META[r.old_state].label} → ${STATE_META[r.new_state].label}. Подію та історію записано`);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Зміна стану: ${device.name}`}
      onClose={onClose}
      width={480}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
          <button className="btn btn-primary" disabled={!state || busy} onClick={apply}>
            {busy ? 'Виконується…' : 'Застосувати'}
          </button>
        </>
      }
    >
      {error && <div className="error-box" role="alert">{error}</div>}
      <p>Поточний стан: <StateBadge state={device.current_state} /></p>
      {device.problem_reason && (
        <div className="problem-box">
          <b>Причина:</b> {device.problem_reason} ({fmtDateTime(device.problem_time)})
          <div className="muted small">
            Перевірте живлення та підключення пристрою до мережі. Коли він знову працює, оберіть стан «Увімкнено».
          </div>
        </div>
      )}
      <div className="state-choice" role="radiogroup" aria-label="Новий стан">
        {STATE_OPTIONS.filter((o) => o.value !== device.current_state).map((o) => (
          <label key={o.value} className={`state-option ${state === o.value ? 'selected' : ''}`}>
            <input type="radio" name="state" value={o.value} checked={state === o.value} onChange={() => setState(o.value)} />
            <StateBadge state={o.value} />
          </label>
        ))}
      </div>
      <p className="muted small">
        Зміна виконується однією транзакцією: оновлюється стан пристрою, додається запис в історію станів
        і подія в журнал. Якщо будь-яка дія не вдасться, жодна зміна не збережеться.
      </p>
    </Modal>
  );
}

function generateSerial(rows) {
  const used = new Set(rows.map((r) => r.serial_number));
  const year = new Date().getFullYear();
  let serial;
  do {
    serial = `SN-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  } while (used.has(serial));
  return serial;
}

export default function Devices() {
  const { isAdmin } = useAuth();
  const [params] = useSearchParams();
  const initialState = params.get('state');
  const [stateFor, setStateFor] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <CrudPage
        title="Пристрої"
        subtitle="Розумні пристрої в усіх будинках: стан, режим роботи та розташування"
        endpoint="/devices"
        rowKey="device_id"
        columns={columns}
        fields={fields}
        filters={filters}
        searchPlaceholder="Пошук за назвою, серійним номером, кімнатою…"
        labels={{ new: 'Новий пристрій', acc: 'пристрій', added: 'Пристрій додано', deleted: 'Пристрій видалено' }}
        describe={(r) => r.name}
        toForm={(r) => ({ ...r, install_date: r.install_date?.slice(0, 10) })}
        reloadKey={reloadKey}
        initialFilters={initialState ? { current_state: initialState } : {}}
        newDefaults={(rows) => ({ serial_number: generateSerial(rows) })}
        extraActions={(row) => isAdmin && (
          <button className="icon-btn" title="Змінити стан" aria-label="Змінити стан" onClick={() => setStateFor(row)}>
            <Icon name="power" size={18} />
          </button>
        )}
      />
      {stateFor && (
        <StateDialog
          device={stateFor}
          onClose={() => setStateFor(null)}
          onDone={() => { setStateFor(null); setReloadKey((k) => k + 1); }}
        />
      )}
    </>
  );
}
