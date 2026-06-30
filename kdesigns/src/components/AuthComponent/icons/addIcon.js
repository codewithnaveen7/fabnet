import React from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../context/PermissionProvider';

const AddIcon=(props) =>{
  const {isCreate}=usePermissions()
  if (isCreate) return <Link {...props}  />;
  return null
}
AddIcon.defaultProps={
  className:'pi pi-plus-circle'
}
export default React.memo(AddIcon)
