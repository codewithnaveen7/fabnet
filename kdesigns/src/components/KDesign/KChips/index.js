import { Chips } from 'primereact/chips';
import React from "react";
import PropTypes from "prop-types";

const KChips = (props) => {
  const {
    inputId,
    name,
    separator,
    value,
    onChange,
    className,
    itemTemplate,
    onBlur,
    disabled
  } = props;
  return (
    <Chips
    inputId={inputId}
    name={name}
    separator={separator}
    value={value}
    onChange={onChange}
    className={className}
    itemTemplate={itemTemplate}
    onBlur={onBlur}
    disabled={disabled}
    />
  );
};

KChips.propTypes = {
  inputId: PropTypes.string,
  name: PropTypes.string,
  separator: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};
export default KChips;
