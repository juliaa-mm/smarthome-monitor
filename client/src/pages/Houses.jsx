import CrudPage from '../components/CrudPage';
import Tabs from '../components/Tabs';
import { houseOptions } from '../lib/options';

const houseColumns = [
  { key: 'house_id', label: '№', width: 56, align: 'right' },
  { key: 'name', label: 'Назва', render: (r) => <span className="cell-title">{r.name}</span> },
  { key: 'address', label: 'Адреса' },
  { key: 'city', label: 'Місто' },
  { key: 'rooms_count', label: 'Кімнат', align: 'right' },
  { key: 'devices_count', label: 'Пристроїв', align: 'right' },
];

const houseFields = [
  { name: 'name', label: 'Назва', required: true, max: 100, wide: true, placeholder: 'Наприклад: Квартира на Печерську' },
  { name: 'address', label: 'Адреса', required: true, max: 200, hint: 'Адреса має бути унікальною' },
  { name: 'city', label: 'Місто', required: true, max: 100 },
];

const roomColumns = [
  { key: 'room_id', label: '№', width: 56, align: 'right' },
  { key: 'name', label: 'Кімната', render: (r) => <span className="cell-title">{r.name}</span> },
  { key: 'house_name', label: 'Будинок' },
  { key: 'floor', label: 'Поверх', align: 'right' },
  { key: 'devices_count', label: 'Пристроїв', align: 'right' },
];

const roomFields = [
  { name: 'house_id', label: 'Будинок', type: 'select', required: true, wide: true, ...houseOptions },
  { name: 'name', label: 'Назва кімнати', required: true, max: 100, hint: 'Не може повторюватися в межах будинку' },
  {
    name: 'floor', label: 'Поверх', type: 'number', min: 0, maxValue: 50, hint: 'Від 0 до 50, за замовчуванням 1',
    validate: (v) => (Number(v) < 0 || Number(v) > 50 ? 'Поверх має бути від 0 до 50' : null),
  },
];

export default function Houses() {
  return (
    <Tabs tabs={[
      {
        id: 'houses', label: 'Будинки', render: () => (
          <CrudPage
            title="Будинки"
            subtitle="Об'єкти, у яких встановлено розумні пристрої"
            endpoint="/houses"
            rowKey="house_id"
            columns={houseColumns}
            fields={houseFields}
            filters={[]}
            searchPlaceholder="Пошук за назвою, адресою, містом…"
            labels={{ new: 'Новий будинок', acc: 'будинок', added: 'Будинок додано', deleted: 'Будинок видалено' }}
            describe={(r) => r.name}
          />
        ),
      },
      {
        id: 'rooms', label: 'Кімнати', render: () => (
          <CrudPage
            title="Кімнати"
            subtitle="Приміщення будинків і кількість пристроїв у кожному"
            endpoint="/rooms"
            rowKey="room_id"
            columns={roomColumns}
            fields={roomFields}
            filters={[{ name: 'house_id', label: 'Будинок', ...houseOptions }]}
            searchPlaceholder="Пошук кімнати…"
            labels={{ new: 'Нова кімната', acc: 'кімнату', added: 'Кімнату додано', deleted: 'Кімнату видалено' }}
            describe={(r) => `${r.name}, ${r.house_name}`}
          />
        ),
      },
    ]} />
  );
}
