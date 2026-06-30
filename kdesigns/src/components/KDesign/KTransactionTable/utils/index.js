import React from 'react';
import Groups from '../templates/Groups';
import Shipments from '../templates/Shipments';
import Invoices from '../templates/Invoices';
import Containers from '../templates/Containers';
import Documents from '../templates/Documents';
import MBL from '../templates/MBL';
import Lines from '../templates/Lines';
import References from '../templates/References';
import Parties from '../templates/Parties';
import Transactions from '../templates/Transactions';

export const getRowExpansionTemplate = ({
  data,
  options,
  expandedColumnLevel1,
}) => {
  const components = {
    filedGroups: (
      <Groups
        options={options}
        data={data}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    shipments: (
      <Shipments
        options={options}
        data={data}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    invoices: (
      <Invoices
        options={options}
        data={data.invoices}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    containers: (
      <Containers
        options={options}
        data={data.containers}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    documents: (
      <Documents
        options={options}
        data={data.documents}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    mbl: (
      <MBL
        options={options}
        data={data}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    lines: (
      <Lines
        options={options}
        data={data.lines}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    references: (
      <References
        options={options}
        data={data.references}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    parties: (
      <Parties
        options={options}
        data={data.parties}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
    transactions: (
      <Transactions
        options={options}
        data={data.transactions}
        expandedColumnLevel1={expandedColumnLevel1}
      />
    ),
  };

  return components[expandedColumnLevel1] || <div />;
};

export const filterPlaceholders = {
  transactionId: 'Transaction ID',
  customer: 'Customer',
  transactionStatus: 'Filing Status',
  customsStatus: 'Customs status',
  mbl: 'MBL',
  exportCountry: 'Export Country',
  importCountry: 'Import Country',
};
