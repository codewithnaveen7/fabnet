import React from 'react';

export default function Cell({ children, ...rest }) {
  return <td {...rest}>{children}</td>;
}
