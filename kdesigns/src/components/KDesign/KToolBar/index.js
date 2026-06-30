import { Toolbar } from "primereact/toolbar";
import React from "react";

function KToolBar({ className, left, right, center, ...rest }) {
  return (
    <Toolbar
      className={className}
      left={left}
      right={right}
      center={center}
      {...rest}
    />
  );
}

export default KToolBar;
