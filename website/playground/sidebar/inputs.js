import * as React from "react";

export function Checkbox({ label: _label, title, checked, onChange }) {
  return (
    <label title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
      />{" "}
      {_label}
    </label>
  );
}

export function Select({ label: _label, title, values, selected, onChange }) {
  return (
    <label title={title}>
      {_label}{" "}
      <select value={selected} onChange={(ev) => onChange(ev.target.value)}>
        {values.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NumberInput({
  label: _label,
  title,
  value,
  min,
  max,
  step,
  onChange,
}) {
  return (
    <label title={title}>
      {_label}{" "}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(parseInt(ev.target.value, 10))}
      />
    </label>
  );
}
