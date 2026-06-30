import React from "react";
import { Link } from "react-router-dom";
import { usePermissions } from "../context/PermissionProvider";

const DeleteIcon = (props) => {
  const { isDelete } = usePermissions();
  if (isDelete) return <Link {...props} />;
  return null;
};
DeleteIcon.defaultProps = {
  className: "pi pi-trash",
};
export default React.memo(DeleteIcon);
