import { InputSwitch } from "primereact/inputswitch";
import React from "react";
import PropTypes from "prop-types";
import "./_KInputSwitch.scss";

export default function KInputSwitch(props) {
  const { disabled, name, checked, onChange } = props;
  return (
    <InputSwitch
      disabled={disabled}
      name={name}
      checked={checked}
      onChange={onChange}
    />
  );
}

KInputSwitch.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};
