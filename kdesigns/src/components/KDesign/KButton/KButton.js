import { Button } from "primereact/button";
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import styles from  './KButton.module.scss'

const KButton = forwardRef((props,ref) => {
  const {
    label,
    className = "",
    onClick,
    icon,
    rounded,
    text,
    disabled,
    type,
    loading,
    severity,
    outlined,
    onMouseEnter,
    ...rest
  } = props;
  return (
    <Button
      label={label}
      className={`${styles["k-button"]}  ${className}`}
      onClick={onClick}
      icon={icon}
      rounded={rounded}
      text={text}
      disabled={disabled}
      type={type}
      loading={loading}
      severity={severity}
      outlined={outlined}
      onMouseEnter={onMouseEnter}
      {...rest}
      ref={ref}
    />
  );
});

KButton.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.string,
  rounded: PropTypes.bool,
  outlined: PropTypes.bool,
  text: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  loading: PropTypes.bool,
  severity: PropTypes.oneOf([
    "success",
    "help",
    "warning",
    "secondary",
    "info",
    "danger",
  ]),
};
export default KButton;
