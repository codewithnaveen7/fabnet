import React from 'react';

export default function Footer({ children, className = '', ...rest }) {
  return (
    <tfoot
      className={['p-datatable-footer', ...className.split(' ')].join(' ')}
      {...rest}
    >
      {children}
    </tfoot>
  );
}
