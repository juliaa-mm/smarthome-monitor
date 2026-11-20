import { useEffect, useMemo, useState } from 'react';
import { api, qs } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useFetch } from '../lib/useFetch';
import DataTable from './DataTable';
import EntityForm from './EntityForm';
import Icon from './Icon';
import Select from './Select';
import { ConfirmDialog, ErrorBox, Loader, Modal, PageHeader } from './ui';

function FilterSelect({ filter, value, onChange }) {
  const [options, setOptions] = useState(filter.options || []);
  useEffect(() => {
    if (!filter.optionsUrl) return;
    api.get(filter.optionsUrl)
      .then((rows) => setOptions(rows.map((r) => ({ value: r[filter.optionValue], label: filter.optionLabel(r), hint: filter.optionHint?.(r), group: filter.optionGroup?.(r) }))))
      .catch(() => {});
  }, [filter.optionsUrl]);
  return (
    <div className="filter">
      <span>{filter.label}</span>
      <Select
        value={value || ''}
        onChange={(v) => onChange(filter.name, v)}
        options={options}
        emptyLabel="Усі"
        ariaLabel={filter.label}
        searchable={filter.searchable}
      />
    </div>
  );
}

export default function CrudPage({
  title, subtitle, endpoint, rowKey, columns, fields, filters = [],
  searchPlaceholder = 'Пошук…', labels = {}, describe = () => '',
  toForm = (r) => r, extraActions, headerExtra, initialSort, reloadKey, canCreate = true, canDelete = true, top, initialFilters = {}, newDefaults,
}) {
  const L = { new: 'Новий запис', acc: 'запис', added: 'Запис додано', deleted: 'Запис видалено', ...labels };
  const { isAdmin } = useAuth();
  const notify = useToast();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const url = useMemo(() => `${endpoint}${qs({ q: debounced, ...filterValues })}`, [endpoint, debounced, filterValues]);
  const { data, loading, error, reload } = useFetch(url, [reloadKey]);

  const setFilter = (name, v) => setFilterValues((s) => ({ ...s, [name]: v }));
  const resetFilters = () => { setFilterValues({}); setSearch(''); };
  const hasFilters = search || Object.values(filterValues).some(Boolean);

  const save = async (payload) => {
    if (editing?.[rowKey]) {
      await api.put(`${endpoint}/${editing[rowKey]}`, payload);
      notify(`Зміни збережено`);
    } else {
      await api.post(endpoint, payload);
      notify(L.added);
    }
    setEditing(null);
    reload();
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.del(`${endpoint}/${deleting[rowKey]}`);
      notify(L.deleted);
      setDeleting(null);
      reload();
    } catch (e) {
      notify(e.message, 'danger');
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const actions = (row) => (
    <div className="row-actions">
      {extraActions?.(row, reload)}
      {isAdmin && fields && (
        <button className="icon-btn" title="Редагувати" aria-label="Редагувати" onClick={() => setEditing(row)}>
          <Icon name="edit" size={18} />
        </button>
      )}
      {isAdmin && canDelete && (
        <button className="icon-btn icon-btn-danger" title="Видалити" aria-label="Видалити" onClick={() => setDeleting(row)}>
          <Icon name="trash" size={18} />
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        {headerExtra}
        {isAdmin && fields && canCreate && (
          <button className="btn btn-primary" onClick={() => setEditing({})}>
            <Icon name="plus" size={18} /> Додати
          </button>
        )}
      </PageHeader>

      {top}

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <input
            className="input"
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Пошук"
          />
        </label>
        {filters.map((f) => (
          <FilterSelect key={f.name} filter={f} value={filterValues[f.name]} onChange={setFilter} />
        ))}
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Скинути фільтри</button>}
      </div>

      <div className="card">
        {error ? <ErrorBox message={error} onRetry={reload} />
          : loading && !data ? <Loader />
          : <DataTable columns={columns} rows={data || []} rowKey={rowKey} actions={actions} initialSort={initialSort} />}
      </div>

      {editing && (
        <Modal title={editing[rowKey] ? `Редагування: ${describe(editing)}` : L.new} onClose={() => setEditing(null)}>
          <EntityForm
            fields={fields}
            initial={editing[rowKey] ? toForm(editing) : (newDefaults?.(data || []) || {})}
            onSubmit={save}
            onCancel={() => setEditing(null)}
            submitText={editing[rowKey] ? 'Зберегти зміни' : 'Додати'}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Підтвердження видалення"
          message={`Видалити ${L.acc} «${describe(deleting)}»? Цю дію неможливо скасувати.`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </>
  );
}
