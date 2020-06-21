import * as React from "react";
import groupBy from "lodash/groupBy";

import { SidebarCategory } from "./components";
import Option from "./options";

export default function ({
  categories,
  availableOptions,
  optionValues,
  onOptionValueChange,
}) {
  const options = groupBy(availableOptions, "category");
  return categories.map((category) =>
    options[category] ? (
      <SidebarCategory key={category} title={category}>
        {options[category].map((option) => (
          <Option
            key={option.name}
            option={option}
            value={optionValues[option.name]}
            onChange={onOptionValueChange}
          />
        ))}
      </SidebarCategory>
    ) : null
  );
}
