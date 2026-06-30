import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { KTransactionTableStyles } from '../styles';

function Lines({ data }) {
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
          field="lineNumber"
          header="Line Item"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="sku"
          header="SKU"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="description"
          header="Description"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="po"
          header="PO"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="mfr"
          header="MFR"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="hts"
          header="HTS"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="countryOfOrigin"
          header="Country of Origin"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="quantity"
          header="Quantity"
        />
      </DataTable>
    </div>
  );
}

export default Lines;
