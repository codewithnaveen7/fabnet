import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { KTransactionTableStyles } from '../styles';

function Transactions({ data }) {
  const [expandedRows, setExpandedRows] = useState(null);
  return (
    <div className="p-3" style={{ maxWidth: '95vw' }}>
      <DataTable
        value={data}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        dataKey="id"
        tableStyle={{ minWidth: '150vw' }}
        size="small"
      >
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="transactions"
          header="Reference key"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="filingDate"
          header="Filing Date"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="generatedDoc"
          header="Generated Doc"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="transactionNumber"
          header="Transaction Number"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="item1"
          header="Item 2"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="item2"
          header="Item 2"
        />
      </DataTable>
    </div>
  );
}

export default Transactions;
