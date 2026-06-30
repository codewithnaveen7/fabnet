import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import React from "react";

export default function KDialog({
  children = null,
  header = "",
  visible = false,
  setVisible = () => {},
  style = {},
  className = "",
  content = "",
  footer,
  dismissableMask=true,
  ...rest
}) {
  return (
    <Dialog
      header={header}
      footer={footer}
      dismissableMask={dismissableMask}
      visible={visible}
      style={{ ...style }}
      onHide={() => setVisible(false)}
      className={classNames("k-dialog", className)}
      {...rest}
    >
      {children || content}
    </Dialog>
  );
}
