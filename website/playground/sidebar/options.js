import * as React from "react";

import { Checkbox, Select, NumberInput } from "./inputs";

export function BooleanOption({ option, value, onChange }) {
  function maybeInvert(value) {
    return option.inverted ? !value : value;
  }
  return (
    <Checkbox
      label={option.cliName}
      title={getDescription(option)}
      checked={maybeInvert(value)}
      onChange={(checked) => onChange(option, maybeInvert(checked))}
    />
  );
}

export function ChoiceOption({ option, value, onChange }) {
  return (
    <Select
      label={option.cliName}
      title={getDescription(option)}
      values={option.choices.map((choice) => choice.value)}
      selected={value}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export function NumberOption({ option, value, onChange }) {
  return (
    <NumberInput
      label={option.cliName}
      title={getDescription(option)}
      min={option.range.start}
      max={option.range.end}
      step={option.range.step}
      value={value}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export default function (props) {
  switch (props.option.type) {
    case "boolean":
      return <BooleanOption {...props} />;
    case "int":
      return <NumberOption {...props} />;
    case "choice":
      return <ChoiceOption {...props} />;
    default:
      throw new Error("unsupported type");
  }
}

function getDescription(option) {
  const description = option.inverted
    ? option.oppositeDescription
    : option.description;
  return description && description.replace(/\n/g, " ");
}
