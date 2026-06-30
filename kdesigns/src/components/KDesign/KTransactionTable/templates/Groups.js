import React from 'react';
import RowExpansionGroup from './Group';

function Groups({ data }) {
  return (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'flex-start', width: '60%' }}
      >
        <h1 style={{ width: '50%' }}>Filed Group(s)</h1>
        <div
          style={{
            display: 'flex',
            width: '50%',
            justifyContent: 'space-between',
          }}
        >
          <h2>View Submisson</h2>
          <h2>Remove from Filing</h2>
          <h2>Edit Transaction</h2>
        </div>
      </div>
      {data.filedGroups.map((group) => (
        <RowExpansionGroup data={group} />
      ))}
    </>
  );
}

export default Groups;
