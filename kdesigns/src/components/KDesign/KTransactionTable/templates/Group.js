import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { getRowExpansionTemplate } from '../utils';
import { KTransactionTableStyles } from '../styles';

function Group({ data }) {
  const [expandedRows, setExpandedRows] = useState(null);
  const [showChildTable, setShowChildTable] = useState(false);
  const [expandedColumnLevel2, setExpandedColumnLevel2] = useState(null);
  const [expandedColumnLevel2Index, setExpandedColumnLevel2Index] =
    useState(null);

  const handleRowExpand = () => setShowChildTable(!showChildTable);

  const rowExpansionTemplate = (data, options) => {
    if (options.index === expandedColumnLevel2Index) {
      return getRowExpansionTemplate({
        data,
        options,
        expandedColumnLevel1: expandedColumnLevel2,
      });
    }
  };

  const handleExpandClick = ({ data, options }) => {
    setExpandedColumnLevel2(options?.field);
    setExpandedColumnLevel2Index(options?.rowIndex);
  };

  const customColumnBodyWithCount = (data, options) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {data[options?.field]?.length}
      <span onClick={() => handleExpandClick({ data, options })}>
        {options.expander?.element}
      </span>
    </div>
  );
  return (
    <div className="p-3" style={{ maxWidth: '95vw', marginBottom: '0.3%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid black',
          padding: '0.5% 1%',
          borderRadius: '6px',
        }}
      >
        <span
          onClick={handleRowExpand}
          style={{ marginRight: '3%', cursor: 'pointer' }}
          className={`pi ${
            showChildTable ? 'pi-angle-down' : 'pi-angle-right'
          }`}
        />
        <Checkbox size={90} style={{ marginRight: '1%' }} />
        {[1, 1, 1].map(() => (
          <Button
            outlined
            style={{ margin: '0 0.1%' }}
            severity="secondary"
            label="Vessel: CSL Manhattan"
          />
        ))}
        <b>3 Shipments in group</b>
      </div>
      {showChildTable ? (
        <DataTable
          filterDisplay="row"
          value={data.shipments}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
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
          selectionMode={null}
        >
          <Column
            bodyStyle={KTransactionTableStyles.bodyStyle}
            headerStyle={KTransactionTableStyles.headerStyle}
            selectionMode="multiple"
            field=""
            header=""
          />
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
            body={customColumnBodyWithCount}
            sortable
            field="parties"
            header="Parties"
          />
          <Column
            bodyStyle={KTransactionTableStyles.bodyStyle}
            headerStyle={KTransactionTableStyles.headerStyle}
            expander
            body={customColumnBodyWithCount}
            sortable
            field="containers"
            header="Containers"
          />
          <Column
            bodyStyle={KTransactionTableStyles.bodyStyle}
            headerStyle={KTransactionTableStyles.headerStyle}
            expander
            body={customColumnBodyWithCount}
            sortable
            field="invoices"
            header="Invoices"
          />
          <Column
            bodyStyle={KTransactionTableStyles.bodyStyle}
            headerStyle={KTransactionTableStyles.headerStyle}
            expander
            body={customColumnBodyWithCount}
            sortable
            field="transactions"
            header="Transactions"
          />
          <Column
            bodyStyle={KTransactionTableStyles.bodyStyle}
            headerStyle={KTransactionTableStyles.headerStyle}
            expander
            body={customColumnBodyWithCount}
            sortable
            field="documents"
            header="Documents"
          />
          <Column
            bodyStyle={KTransactionTableStyles.bodyStyle}
            headerStyle={KTransactionTableStyles.headerStyle}
            expander
            body={customColumnBodyWithCount}
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
      ) : null}
    </div>
  );
}

export default Group;
