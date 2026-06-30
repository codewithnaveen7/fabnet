
import React, { useEffect, useState, forwardRef } from "react";
import { AutoComplete } from "primereact/autocomplete";

const KAutocomplete1 = forwardRef(({
  value,
  suggestions,
  completeMethod,
  onFocus = () => { },
  onChange,
  field,
  onSelect,
  disabled,
  itemTemplate,
  minLength = 1,
  panelStyle = {},
  forceSelection,
  onClick
}, ref) => {
  const [selectedValue, setSelectedValue] = useState(value);

  return (
    <AutoComplete
      ref={ref}
      field={field}
      value={selectedValue || value}
      suggestions={suggestions}
      completeMethod={completeMethod}
      onFocus={onFocus}
      onChange={(e) => {
        setSelectedValue(e.value);
        onChange(e);
        if(!e.value){
          onSelect(e)
        }
      }}
      onSelect={(e) => {
        setSelectedValue("");
        onSelect(e);
      }}
      disabled={disabled}
      itemTemplate={itemTemplate}
      minLength={minLength}
      panelStyle={panelStyle}
      forceSelection={forceSelection}
      onClick={onClick}
    />
  );
});
KAutocomplete1.defaultProps = {
  onChange: (e) => e
}
export default KAutocomplete1
