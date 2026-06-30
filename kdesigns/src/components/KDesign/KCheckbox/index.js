import React from "react";
import { Checkbox } from "primereact/checkbox";

function KCheckbox({label,labelClassName,...rest}) {
  return (
    <>
      <Checkbox {...rest} />
      {label && <label htmlFor={label} className={labelClassName}>
        {label}
      </label>}
    </>
  );
}

export default KCheckbox;
