import React, { forwardRef } from "react";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";

const KInputText = forwardRef(function ({ field, form, ...props }, ref) {
  const { className = "", error = false } = props;
  return (
    <InputText
      {...field}
      {...props}
      className={classNames(className, { "p-invalid": !!error })}
      ref={ref}
    />
  );
});

export default KInputText;
