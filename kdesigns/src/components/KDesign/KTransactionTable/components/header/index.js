import React from 'react';

function Header({ resetScroll, onReset }) {
  return (
    <div className="k-transaction-table__header">
      <div>
        <span className="pi pi-arrow-up " />{' '}
        <span
          onClick={resetScroll}
          className="k-transaction-table__scroll-top k-transaction-table__child"
        >
          Back to top
        </span>
      </div>
      <div className="k-transaction-table__child" onClick={onReset}>
        Reset Filters
      </div>
    </div>
  );
}

export default Header;
