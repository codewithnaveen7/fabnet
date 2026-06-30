import React from 'react';
import { usePermissions } from '../context/PermissionProvider';
import KButton from "../../KDesign/KButton/KButton";

const DeleteButton=(props) =>{
  const {isDelete}=usePermissions()
  if (isDelete) return <KButton {...props}  />;
  return null
}

export default React.memo(DeleteButton)