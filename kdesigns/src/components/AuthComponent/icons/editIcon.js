import React from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../context/PermissionProvider';

const EditIcon=(props) =>{
  const {isEdit}=usePermissions()
  if (isEdit) return <Link {...props} />;
  return null
}
EditIcon.defaultProps={
  className:'pi pi-pencil'
}
export default React.memo(EditIcon)
