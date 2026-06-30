
import React, { createContext } from 'react';

const PermissionsContext = createContext({ isCreate: false, isEdit: false,isDelete:false });

export const usePermissions = () => {
  return React.useContext(PermissionsContext);
};

export const PermissionsProvider = ({permissions=[],children}) => {

  const checkpermision=React.useMemo(()=>{
   return {isCreate:permissions.includes("PERMISSION_CREATE"),isEdit:permissions.includes("PERMISSION_UPDATE"),isDelete:permissions.includes("PERMISSION_DELETE")}
  },[permissions])
  return (
    <PermissionsContext.Provider value={checkpermision }>
      {children}
    </PermissionsContext.Provider>
  );
};
