import React, { createContext, useRef, useMemo } from "react";
import { Toast } from "primereact/toast";
import ToastTemplate from "./ToastTemplate";
import { ConfirmDialog } from "primereact/confirmdialog";

export const ToastContext = createContext({});

function ToastProvider({ children, position }) {
  const toastRef = useRef(null);

  const show =
    (severity, icon) =>
    (payload, options = {}) => {
      const defaultOptions = {
        severity,
        ...options,
      };

      if (typeof payload === "string") {
        defaultOptions.detail = payload;
      } else {
        defaultOptions.content = (
          <ToastTemplate icon={options?.icon || icon}>{payload}</ToastTemplate>
        );
      }

      toastRef.current.show(defaultOptions);
    };

  const contextValue = useMemo(() => {
    return {
      warn: show("warn", "pi pi-exclamation-triangle"),
      success: show("success", "pi pi-check"),
      error: show("error", "pi pi-times-circle"),
      info: show("info", "pi pi-exclamation-circle"),
      remove: () => {
        toastRef.current.clear();
      },
    };
  }, []);
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast ref={toastRef} position={position} />
      <ConfirmDialog />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
