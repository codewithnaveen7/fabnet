import { Toast } from 'primereact/toast';
import React, { forwardRef } from 'react';

const KToast = forwardRef((props, ref) => {
  return <Toast {...props} ref={ref} />;
});
export default KToast;
