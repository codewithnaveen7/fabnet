import { MultiSelect } from "primereact/multiselect";
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { classNames } from "primereact/utils";

const KMultiSelect = forwardRef(({ className, disabled, pt, ...rest }, ref) => {
  const dropDownRef = useRef(null);
  useImperativeHandle(ref, () => ({
    show: dropDownRef?.current?.show,
    hide: dropDownRef?.current?.hide,
  }));

  return (
    <MultiSelect
      {...rest}
      disabled={disabled}
      className={classNames(disabled ? "disabled" : "", className)}
      ref={dropDownRef}
      pt={pt}
    />
  );
});

KMultiSelect.defaultProps = {
  className: "",
  disabled: false,
  pt: {
    checkboxIcon: {
      onClick: (e) => {
        e.stopPropagation();
        e.target?.parentNode?.click && e.target.parentNode.click();
      },
    },
    headerCheckbox: {
      onClick: (e) => {
        e.stopPropagation();
        e.target?.parentNode?.click && e.target.parentNode.click();
      },
    },
  },
};

export default KMultiSelect;
