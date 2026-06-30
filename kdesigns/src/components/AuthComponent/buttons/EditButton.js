import React from 'react';
import { usePermissions } from '../context/PermissionProvider';
import KButton from "../../KDesign/KButton/KButton";

const EditButton=(props) =>{
  const {isEdit}=usePermissions()
  if (isEdit) return <KButton {...props}  />;
  return null
}

export default React.memo(EditButton)