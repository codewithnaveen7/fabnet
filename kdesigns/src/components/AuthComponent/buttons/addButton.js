import React from 'react';
import { usePermissions } from '../context/PermissionProvider';
import KButton from "../../KDesign/KButton/KButton";

const AddButton=(props) =>{
  const {isCreate}=usePermissions()
  if (isCreate) return <KButton {...props}  />;
  return null
}

export default React.memo(AddButton)