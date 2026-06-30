import React from 'react';

export default function Header({ children, className = '', ...rest }) {
  return (
    <thead
      className={['p-datatable-thead', ...className.split(' ')].join(' ')}
      {...rest}
    >
      {children}
    </thead>
  );
}
