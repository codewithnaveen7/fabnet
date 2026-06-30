import React from 'react';
import { Badge } from 'primereact/badge';
 
function KBadge({ severity, value, classsName = '',onClick, size = 'small',style }) {
  return <Badge severity={severity} value={value} className={`k-badge ${classsName}`} onClick={onClick} size={size} style={style} />;
}
 
export default KBadge;