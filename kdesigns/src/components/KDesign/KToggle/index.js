import { SelectButton } from 'primereact/selectbutton';
import React from 'react';
import './KToggle.css';
import PropTypes from 'prop-types';

function KToggle({ value, options, onChange,itemTemplate,className='' }) {
  const handleChange = (event) => {
    if (event.value) {
      onChange(event);
    }
  };
  return (
    <SelectButton
      value={value}
      optionLabel="name"
      options={options}
      size="small"
      style={{ padding: '.5rem .25rem' }}
      className={`k-toggle ${className}`}
      onChange={handleChange}
      itemTemplate={itemTemplate}
    />
  );
}

KToggle.propTypes = {
  value: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array,
  onChange: PropTypes.func,
};

export default KToggle;
