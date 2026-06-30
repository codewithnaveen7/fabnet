import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { getRowExpansionTemplate } from '../utils';
import { KTransactionTableStyles } from '../styles';

function Invoices({ data }) {
  const [expandedRows, setExpandedRows] = useState(null);
  const [expandedColumnLevel3, setExpandedColumnLevel3] = useState(null);
  const [expandedColumnLevel3Index, setExpandedColumnLevel3Index] = useState(null);

  const rowExpansionTemplate = (data, options) => {
    if (options.index === expandedColumnLevel3Index) {
      return getRowExpansionTemplate({
        data,
        options,
        expandedColumnLevel1: 'lines',
      });
    }
  };

  const handleExpandClick = ({ data, options }) => {
    setExpandedColumnLevel3(options?.field);
    setExpandedColumnLevel3Index(options?.rowIndex);
  };

  const customColumnBodyWithClick = (data, options) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span onClick={() => handleExpandClick({ data, options })}>
        {options.expander?.element}
      </span>
    </div>
  );

  return (
    <div className="p-3" style={{ maxWidth: '95vw' }}>
      <DataTable
        rowExpansionTemplate={rowExpansionTemplate}
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
          expander
          field="lines"
          header=""
          body={customColumnBodyWithClick}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="invoiceNumber"
          header="Invoice #"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="hbl"
          header="HBL"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="grossWeight"
          header="Gross Weight"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="netWeight"
          header="Nett Weight"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="totalQuantity"
          header="Total Quantity"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="currency"
          header="Currency"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="value"
          header="Value"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="date"
          header="Date"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="manufacturer"
          header="Manufacturer"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="container"
          header="Container"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          field="incoterms"
          header="Incoterms"
        />
      </DataTable>
    </div>
  );
}

export default Invoices;
