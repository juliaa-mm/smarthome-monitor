import CrudPage from '../components/CrudPage';
import Tabs from '../components/Tabs';
import { deviceOptions, parameterOptions } from '../lib/options';
import { unitLabel } from '../lib/format';

export default function Directories() {
  return (
    <Tabs tabs={[
      {
        id: 'types', label: 'Типи пристроїв', render: () => (
          <CrudPage
            title="Типи пристроїв"
            subtitle="Довідник категорій розумних пристроїв"
            endpoint="/device-types"
            rowKey="type_id"
            columns={[
              { key: 'type_id', label: '№', width: 56, align: 'right' },
              { key: 'name', label: 'Назва', render: (r) => <span className="cell-title">{r.name}</span> },
              { key: 'category', label: 'Категорія' },
              { key: 'description', label: 'Опис' },
              { key: 'devices_count', label: 'Пристроїв', align: 'right' },
            ]}
            fields={[
              { name: 'name', label: 'Назва', required: true, max: 100 },
              { name: 'category', label: 'Категорія', required: true, max: 100, placeholder: 'Освітлення, Безпека…' },
              { name: 'description', label: 'Опис', type: 'textarea', max: 300, wide: true },
            ]}
            labels={{ new: 'Новий тип пристрою', acc: 'тип пристрою', added: 'Тип пристрою додано', deleted: 'Тип пристрою видалено' }}
            describe={(r) => r.name}
          />
        ),
      },
      {
        id: 'params', label: 'Параметри вимірювання', render: () => (
          <CrudPage
            title="Параметри вимірювання"
            subtitle="Величини, які вимірюють сенсори, та одиниці виміру"
            endpoint="/parameters"
            rowKey="parameter_id"
            columns={[
              { key: 'parameter_id', label: '№', width: 56, align: 'right' },
              { key: 'name', label: 'Параметр', render: (r) => <span className="cell-title">{r.name}</span> },
              { key: 'unit', label: 'Одиниця виміру', render: (r) => unitLabel(r.unit) },
            ]}
            fields={[
              { name: 'name', label: 'Назва параметра', required: true, max: 100 },
              { name: 'unit', label: 'Одиниця виміру', required: true, max: 20, placeholder: '°C, %, лк…' },
            ]}
            labels={{ new: 'Новий параметр', acc: 'параметр', added: 'Параметр додано', deleted: 'Параметр видалено' }}
            describe={(r) => r.name}
          />
        ),
      },
      {
        id: 'event-types', label: 'Типи подій', render: () => (
          <CrudPage
            title="Типи подій"
            subtitle="Класифікація подій, що відбуваються з пристроями"
            endpoint="/event-types"
            rowKey="event_type_id"
            columns={[
              { key: 'event_type_id', label: '№', width: 56, align: 'right' },
              { key: 'name', label: 'Тип події', render: (r) => <span className="cell-title">{r.name}</span> },
              { key: 'description', label: 'Опис' },
            ]}
            fields={[
              { name: 'name', label: 'Назва', required: true, max: 100 },
              { name: 'description', label: 'Опис', type: 'textarea', max: 300, wide: true },
            ]}
            labels={{ new: 'Новий тип події', acc: 'тип події', added: 'Тип події додано', deleted: 'Тип події видалено' }}
            describe={(r) => r.name}
          />
        ),
      },
      {
        id: 'links', label: 'Параметри пристроїв', render: () => (
          <CrudPage
            title="Параметри пристроїв"
            subtitle="Які параметри вимірює кожен пристрій (зв'язок «багато до багатьох»)"
            endpoint="/device-parameters"
            rowKey="device_parameter_id"
            columns={[
              { key: 'device_parameter_id', label: '№', width: 56, align: 'right' },
              { key: 'device_name', label: 'Пристрій', render: (r) => <span className="cell-title">{r.device_name}</span> },
              { key: 'parameter_name', label: 'Параметр' },
              { key: 'unit', label: 'Одиниця', render: (r) => unitLabel(r.unit) },
            ]}
            fields={[
              { name: 'device_id', label: 'Пристрій', type: 'select', required: true, wide: true, ...deviceOptions },
              { name: 'parameter_id', label: 'Параметр', type: 'select', required: true, wide: true, ...parameterOptions },
            ]}
            filters={[{ name: 'device_id', label: 'Пристрій', ...deviceOptions }]}
            labels={{ new: 'Новий зв\'язок', acc: 'зв\'язок', added: 'Зв\'язок додано', deleted: 'Зв\'язок видалено' }}
            describe={(r) => `${r.device_name} — ${r.parameter_name}`}
          />
        ),
      },
    ]} />
  );
}
