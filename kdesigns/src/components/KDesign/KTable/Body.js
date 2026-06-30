import React from 'react';

export default function Body({ children, className = '', ...rest }) {
  return (
    <tbody
      className={['p-datatable-tbody', ...className.split(' ')].join(' ')}
      {...rest}
    >
      {children}
    </tbody>
  );
}
