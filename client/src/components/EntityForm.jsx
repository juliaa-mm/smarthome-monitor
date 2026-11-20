import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Select from './Select';

function useOptions(field) {
  const [options, setOptions] = useState(field.options || []);
  useEffect(() => {
    if (!field.optionsUrl) return;
    api.get(field.optionsUrl)
      .then((rows) => setOptions(rows.map((r) => ({
        value: r[field.optionValue],
        label: field.optionLabel(r),
        hint: field.optionHint?.(r),
        group: field.optionGroup?.(r),
      }))))
      .catch(() => setOptions([]));
  }, [field.optionsUrl]);
  return options;
}

function Field({ field, value, onChange, error }) {
  const options = useOptions(field);
  const id = `f-${field.name}`;
  const common = {
    id,
    name: field.name,
    value: value ?? '',
    onChange: (e) => onChange(field.name, e.target.value),
    'aria-invalid': !!error,
    className: `input ${error ? 'input-error' : ''}`,
  };

  let control;
  if (field.type === 'select') {
    control = (
      <Select
        id={id}
        value={value ?? ''}
        onChange={(v) => onChange(field.name, v)}
        options={options}
        placeholder={field.required ? 'Оберіть…' : 'Не вибрано'}
        emptyLabel={field.required ? undefined : 'Не вибрано'}
        invalid={!!error}
        searchable={field.searchable}
      />
    );
  } else if (field.type === 'textarea') {
    control = <textarea {...common} rows={3} maxLength={field.max} placeholder={field.placeholder} />;
  } else if (field.type === 'checkbox') {
    control = (
      <label className="switch">
        <input
          type="checkbox"
          role="switch"
          checked={Number(value) === 1}
          onChange={(e) => onChange(field.name, e.target.checked ? 1 : 0)}
        />
        <span className="switch-track"><span className="switch-thumb" /></span>
        <span className="switch-label">{field.checkLabel || 'Так'}</span>
      </label>
    );
  } else {
    control = (
      <input
        {...common}
        type={field.type || 'text'}
        step={field.step}
        min={field.min}
        max={field.type === 'number' ? field.maxValue : undefined}
        maxLength={field.type === 'number' ? undefined : field.max}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <div className={`form-field ${field.wide ? 'wide' : ''}`}>
      <label htmlFor={id}>
        {field.label}{field.required && <span className="req" title="Обов'язкове поле"> *</span>}
      </label>
      {control}
      {error ? <div className="field-error">{error}</div> : field.hint && <div className="field-hint">{field.hint}</div>}
    </div>
  );
}

export default function EntityForm({ fields, initial, onSubmit, onCancel, submitText = 'Зберегти' }) {
  const [values, setValues] = useState(initial || {});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');

  const change = (name, v) => {
    setValues((s) => ({ ...s, [name]: v }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.required && (v === undefined || v === null || v === '')) errs[f.name] = 'Заповніть це поле';
      if (f.validate && v !== undefined && v !== '') {
        const msg = f.validate(v, values);
        if (msg) errs[f.name] = msg;
      }
    }
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {};
      fields.forEach((f) => { payload[f.name] = values[f.name] === undefined ? '' : values[f.name]; });
      await onSubmit(payload);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {serverError && <div className="error-box" role="alert">{serverError}</div>}
      <div className="form-grid">
        {fields.map((f) => (
          <Field key={f.name} field={f} value={values[f.name]} onChange={change} error={errors[f.name]} />
        ))}
      </div>
      <p className="muted small">Поля, позначені <span className="req">*</span>, є обов'язковими.</p>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Скасувати</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Збереження…' : submitText}</button>
      </div>
    </form>
  );
}
