import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { KTransactionTableStyles } from '../styles';

function Shipments({ data, expandedColumnLevel1 }) {
  const [expandedRows, setExpandedRows] = useState(null);
  return (
    <div className="p-3" style={{ maxWidth: '95vw' }}>
      <DataTable
        filterDisplay="row"
        value={data[expandedColumnLevel1].shipments}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        // rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        tableStyle={{ minWidth: '150vw' }}
        size="small"
        globalFilterFields={[
          'shipmentId',
          'customer',
          'mbl',
          'hbl',
          'exportCountry',
          'importCountry',
          'modeOfTransport',
        ]}
      >
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="shipmentId"
          header="Shipment ID"
          filter
          filterPlaceholder="Search ID Number"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="customer"
          header="Customer"
          filter
          filterPlaceholder="Search Customer Name"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          expander
          sortable
          field="parties"
          header="Parties"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          expander
          sortable
          field="containers"
          header="Containers"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          expander
          sortable
          field="invoices"
          header="Invoices"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          expander
          sortable
          field="transactions"
          header="Transactions"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          expander
          sortable
          field="documents"
          header="Documents"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          expander
          sortable
          field="references"
          header="References"
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="mbl"
          header="MBL"
          filter
          filterPlaceholder="Search MBLs"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="hbl"
          header="HBL"
          filter
          filterPlaceholder="Search HBLs"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="exportCountry"
          header="Export Country"
          filter
          filterPlaceholder="Search Export Country"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="importCountry"
          header="Import Country"
          filter
          filterPlaceholder="Search Import Country"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="modeOfTransport"
          header="Mode of Transport"
          filter
          filterPlaceholder="Search MoT"
          showFilterMenu={false}
        />
        <Column
          bodyStyle={KTransactionTableStyles.bodyStyle}
          headerStyle={KTransactionTableStyles.headerStyle}
          sortable
          field="history"
          header="History"
        />
      </DataTable>
    </div>
  );
}

export default Shipments;
