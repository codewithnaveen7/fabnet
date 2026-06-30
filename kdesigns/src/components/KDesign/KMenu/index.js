import useToggleMenu from "../../../hooks/useToggleMenu";
import { Menu } from "primereact/menu";
import React from "react";

function KMenu({ model, popup, template,pt }) {
  const [menuRef, toggleMenu] = useToggleMenu();
  return (
    <>
      {template && template(toggleMenu)}
      <Menu model={model} ref={menuRef} popup={popup} pt={pt} />
    </>
  );
}

export default KMenu;
