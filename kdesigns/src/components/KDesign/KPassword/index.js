import React from 'react';
import { Password } from 'primereact/password';

function KPassword({form, field, ...props}) {
  return <Password {...field} {...props} />;
}

export default KPassword;