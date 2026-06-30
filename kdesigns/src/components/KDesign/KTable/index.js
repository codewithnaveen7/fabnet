import React from 'react';
import './style.css';
import Header from './Header';
import Body from './Body';
import Row from './Row';
import HeaderCell from './HeaderCell';
import Cell from './Cell';
import Footer from './Footer';

function Table({ children, wrapperCssClass = '', className = '', ...rest }) {
  return (
    <div
      className={[
        'k-table',
        'p-datatable',
        'p-component',
        'w-full',
        wrapperCssClass,
      ].join(' ')}
    >
      <div className="p-datatable-wrapper">
        <table
          className={['p-datatable-table', ...className.split(' ')].join(' ')}
          {...rest}
        >
          {children}
        </table>
      </div>
    </div>
  );
}
Table.Header = Header;
Table.Body = Body;
Table.HeaderCell = HeaderCell;
Table.Cell = Cell;
Table.Row = Row;
Table.Footer = Footer;
export default Table;
