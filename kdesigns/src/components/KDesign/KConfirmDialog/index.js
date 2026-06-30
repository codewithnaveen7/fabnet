import { ConfirmDialog } from "primereact/confirmdialog";
import React, { useState } from "react";
import KButton from "../KButton/KButton";

export default function KConfirmDialog({
  message = "",
  header = "",
  icon = "",
  accept = () => {},
  reject = () => {},
  kButtonProps = {},
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message={message}
        header={header}
        icon={icon}
        accept={accept}
        reject={reject}
        {...rest}
      />
      <KButton {...kButtonProps} onClick={() => setVisible(true)} />
    </>
  );
}
