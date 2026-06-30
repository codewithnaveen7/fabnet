import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { KTransactionTableStyles } from '../styles';

function Documents({ data }) {
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
          field="fullName"
          header="Document Type"
        />
        <Column
          headerStyle={KTransactionTableStyles.headerStyle}
          field="shortName"
          header=""
        />
      </DataTable>
    </div>
  );
}

export default Documents;
