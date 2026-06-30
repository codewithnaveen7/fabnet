import React from 'react';

export default function Row({ children, ...rest }) {
  return <tr {...rest}>{children}</tr>;
}
