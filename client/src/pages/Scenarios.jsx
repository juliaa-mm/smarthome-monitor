import { useEffect, useState } from 'react';
import EntityForm from '../components/EntityForm';
import Icon from '../components/Icon';
import { ConfirmDialog, ErrorBox, Loader, Modal, PageHeader, StateBadge } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useFetch } from '../lib/useFetch';
import { fmtDateTime } from '../lib/format';
import { deviceOptions, roomOptions } from '../lib/options';

const fields = [
  { name: 'name', label: 'Назва сценарію', required: true, max: 150, wide: true },
  { name: 'description', label: 'Опис', type: 'textarea', max: 300, wide: true },
  { name: 'trigger_condition', label: 'Умова запуску', required: true, max: 200, placeholder: 'Час 19:00 / Температура нижче 18 °C', hint: 'Умова «Час ГГ:ХХ» спрацьовує автоматично в цей час щодня' },
  { name: 'action_description', label: 'Дія', required: true, max: 200, placeholder: 'Увімкнути лампу', hint: 'Слова «Увімкнути» / «Вимкнути» визначають новий стан пристрою' },
  { name: 'room_id', label: 'Кімната', type: 'select', ...roomOptions },
  { name: 'device_id', label: 'Пристрій', type: 'select', hint: 'Вкажіть кімнату, пристрій або обидва', ...deviceOptions },
  { name: 'is_active', label: 'Активність', type: 'checkbox', checkLabel: 'Сценарій активний' },
];

function RunResult({ result, onClose }) {
  return (
    <Modal title="Сценарій виконано" onClose={onClose} width={520}
      footer={<button className="btn btn-primary" onClick={onClose}>Готово</button>}>
      <p><b>«{result.scenario_name}»</b></p>
      <div className="result-row">
        <span>{result.device_name}</span>
        <span className="nowrap"><StateBadge state={result.old_state} /> <span className="arrow">→</span> <StateBadge state={result.new_state} /></span>
      </div>
      <ul className="check-list">
        <li>{result.changed ? `Стан пристрою оновлено в таблиці devices` : 'Пристрій уже був у потрібному стані — стан не змінювався'}</li>
        {result.changed && <li>Додано запис №{result.history_id} в історію станів (state_history)</li>}
        <li>Додано подію №{result.event_id} у журнал (events), час {fmtDateTime(result.event_time)}</li>
        <li>Транзакцію підтверджено командою COMMIT</li>
      </ul>
    </Modal>
  );
}

export default function Scenarios() {
  const { isAdmin } = useAuth();
  const notify = useToast();
  const { data, loading, error, reload } = useFetch('/scenarios');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [onlyActive, setOnlyActive] = useState(false);

  useEffect(() => {
    const t = setInterval(reload, 30 * 1000);
    return () => clearInterval(t);
  }, [reload]);

  const run = async (s) => {
    setRunning(s.scenario_id);
    try {
      setResult(await api.post(`/scenarios/${s.scenario_id}/run`));
      reload();
    } catch (e) {
      notify(`Транзакцію скасовано (ROLLBACK): ${e.message}`, 'danger');
    } finally {
      setRunning(null);
    }
  };

  const toggle = async (s) => {
    try {
      await api.put(`/scenarios/${s.scenario_id}`, { is_active: s.is_active ? 0 : 1 });
      notify(s.is_active ? `Сценарій «${s.name}» вимкнено` : `Сценарій «${s.name}» увімкнено`);
      reload();
    } catch (e) {
      notify(e.message, 'danger');
    }
  };

  const save = async (payload) => {
    if (!payload.room_id && !payload.device_id) throw new Error('Вкажіть кімнату або пристрій, для якого працює сценарій');
    if (editing.scenario_id) await api.put(`/scenarios/${editing.scenario_id}`, payload);
    else await api.post('/scenarios', payload);
    notify(editing.scenario_id ? 'Зміни збережено' : 'Сценарій додано');
    setEditing(null);
    reload();
  };

  const remove = async () => {
    try {
      await api.del(`/scenarios/${deleting.scenario_id}`);
      notify('Сценарій видалено');
      reload();
    } catch (e) {
      notify(e.message, 'danger');
    } finally {
      setDeleting(null);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (loading && !data) return <Loader />;
  const list = onlyActive ? data.filter((s) => s.is_active === 1) : data;

  return (
    <>
      <PageHeader title="Сценарії автоматизації" subtitle="Правила, за якими пристрої вмикаються та вимикаються автоматично">
        <label className="switch">
          <input type="checkbox" role="switch" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          <span className="switch-track"><span className="switch-thumb" /></span>
          <span className="switch-label">Лише активні</span>
        </label>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setEditing({ is_active: 1 })}>
            <Icon name="plus" size={18} /> Додати
          </button>
        )}
      </PageHeader>

      <div className="scenario-grid">
        {list.map((s) => (
          <article key={s.scenario_id} className={`scenario ${s.is_active ? '' : 'scenario-off'}`}>
            <header>
              <h3>{s.name}</h3>
              <label className={`switch ${isAdmin ? '' : 'switch-readonly'}`} title={s.is_active ? 'Сценарій активний' : 'Сценарій неактивний'}>
                <input type="checkbox" role="switch" checked={s.is_active === 1} disabled={!isAdmin}
                  aria-label={`Активність сценарію «${s.name}»`} onChange={() => toggle(s)} />
                <span className="switch-track"><span className="switch-thumb" /></span>
                <span className="switch-label">{s.is_active ? 'Увімк.' : 'Вимк.'}</span>
              </label>
            </header>
            {s.description && <p className="muted">{s.description}</p>}
            <dl className="scenario-meta">
              <dt>Якщо</dt><dd>{s.trigger_condition}</dd>
              <dt>Тоді</dt><dd>{s.action_description}</dd>
              <dt>Де</dt><dd>{s.room_name ? `${s.room_name}, ${s.house_name}` : '—'}</dd>
              <dt>Пристрій</dt>
              <dd>{s.device_name ? <>{s.device_name} <StateBadge state={s.device_state} /></> : '—'}</dd>
            </dl>
            <footer>
              <span className="muted small">
                Спрацювань: {s.runs_count}{s.last_run ? ` · останнє ${fmtDateTime(s.last_run)}` : ''}
              </span>
              {isAdmin && (
                <div className="row-actions">
                  <button className="icon-btn" title="Редагувати" aria-label="Редагувати" onClick={() => setEditing(s)}>
                    <Icon name="edit" size={18} />
                  </button>
                  <button className="icon-btn icon-btn-danger" title="Видалити" aria-label="Видалити" onClick={() => setDeleting(s)}>
                    <Icon name="trash" size={18} />
                  </button>
                  <button className="btn btn-primary btn-sm" disabled={!s.is_active || running === s.scenario_id}
                    title={s.is_active ? 'Виконати сценарій зараз' : 'Неактивний сценарій не можна виконати'}
                    onClick={() => run(s)}>
                    <Icon name="play" size={16} /> {running === s.scenario_id ? 'Виконується…' : 'Виконати'}
                  </button>
                </div>
              )}
            </footer>
          </article>
        ))}
      </div>

      {editing && (
        <Modal title={editing.scenario_id ? `Редагування: ${editing.name}` : 'Новий сценарій'} onClose={() => setEditing(null)} width={640}>
          <EntityForm fields={fields} initial={editing} onSubmit={save} onCancel={() => setEditing(null)}
            submitText={editing.scenario_id ? 'Зберегти зміни' : 'Додати'} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog title="Підтвердження видалення"
          message={`Видалити сценарій «${deleting.name}»? Якщо сценарій уже спрацьовував, його не можна видалити — зробіть його неактивним.`}
          onConfirm={remove} onCancel={() => setDeleting(null)} />
      )}
      {result && <RunResult result={result} onClose={() => setResult(null)} />}
    </>
  );
}
