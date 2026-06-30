import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { KTransactionTableStyles } from '../styles';

function Containers({ data }) {
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
          field="number"
          header="Container #"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="seal"
          header="Seal"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="size"
          header="Size"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="quantity"
          header="Quantity"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="weight"
          header="Weight (KG)"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="portOfDischarge"
          header="Port of Discharge"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="deliveryAddress"
          header="Delivery Address"
        />
      </DataTable>
    </div>
  );
}

export default Containers;
