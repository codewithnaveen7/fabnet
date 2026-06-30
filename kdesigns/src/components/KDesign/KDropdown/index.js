import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
function KDropdown({
  name,
  value,
  onChange,
  onBlur,
  options,
  optionLabel,
  placeholder,
  className,
  style,
  optionValue,
  title,
  error = false,
  dropdownRef=null,
  field,
  form,
  ...rest
}) {
  return (
    <Dropdown
      ref={dropdownRef}
      style={style}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      options={options}
      optionLabel={optionLabel}
      placeholder={placeholder}
      className={classNames(className, { 'p-invalid': !!error })}
      optionValue={optionValue}
      title={title}
      {...field}
      {...rest}
    />
  );
}
KDropdown.propTypes = {
  name: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array,
  optionLabel: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  optionValue: PropTypes.string,
  title: PropTypes.string,
  error: PropTypes.bool,
};
export default KDropdown;