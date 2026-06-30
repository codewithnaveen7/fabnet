import React, { useEffect, useState, forwardRef } from "react";
import { AutoComplete } from "primereact/autocomplete";
 
const KAutocomplete = forwardRef(({
  name,
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
  onClick,
  panelFooterTemplate,
  onBlur
}, ref) => {
  const [selectedValue, setSelectedValue] = useState("");
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);
  return (
<AutoComplete
      name={name}
      ref={ref}
      field={field}
      value={selectedValue}
      suggestions={suggestions}
      completeMethod={completeMethod}
      onFocus={onFocus}
      onChange={(e) => {
        setSelectedValue(e.value);
        onChange(e);
      }}
      onSelect={onSelect}
      disabled={disabled}
      itemTemplate={itemTemplate}
      minLength={minLength}
      panelStyle={panelStyle}
      forceSelection={forceSelection}
      onClick={onClick}
      panelFooterTemplate={panelFooterTemplate}
      onBlur={onBlur}
    />
  );
});
KAutocomplete.defaultProps = {
  onChange: (e) => e
}
export default KAutocomplete