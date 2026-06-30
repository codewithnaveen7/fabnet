import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { KTransactionTableStyles } from '../styles';

function Parties({ data }) {
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
          field="party"
          header="Party"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="fullName"
          header="Full Name"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="address"
          header="Address"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="addressLine2"
          header="Address Line 2"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="city"
          header="City"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="state"
          header="State"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="zip"
          header="Zip"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="country"
          header="Country"
        />
      </DataTable>
    </div>
  );
}

export default Parties;
