import React from 'react';

export default function HeaderCell({ children, ...rest }) {
  return <th {...rest}>{children}</th>;
}
