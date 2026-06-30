import { Sidebar } from "primereact/sidebar";
import React from "react";

function KSidebar({ visible, onHide, icons, className, children }) {
  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      icons={icons}
      className={className}
    >
      {children}
    </Sidebar>
  );
}

export default KSidebar;
