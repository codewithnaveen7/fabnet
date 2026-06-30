import React from "react";
import PropTypes from "prop-types";
import { classNames } from "primereact/utils";
const KInputWrapper = ({
  name = "",
  label = "",
  className = "",
  isRequired = false,
  children,
  error = false,
  labelCssClass = '',
  errorCssClass = '',
}) => {
  return (
    <div
      className={classNames("k-input-wrapper flex flex-column gap-1 flex-1 mr-2", className)}
    >
      <label className={classNames("", labelCssClass)} htmlFor={name}>
        {label}
        {isRequired ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      {children}
        <div className={classNames("text-red-500", errorCssClass)} style={{minHeight:"1rem"}} id={`${name}-help`}>
          {error}
        </div>
    </div>
  );
};
KInputWrapper.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  isRequired: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  labelCssClass: PropTypes.string,
  errorCssClass: PropTypes.string,
};
export default KInputWrapper;
