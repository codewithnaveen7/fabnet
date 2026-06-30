/* eslint-disable react/forbid-prop-types */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import React from "react";
import PropTypes from "prop-types";
import Body from "./components/body";

export default function KTransactionTable({
  dataTableRef,
  loading,
  totalRecords,
  records,
  tableState,
  onPage,
  onSort,
  onFilter,
  columns,
  customBodyMap,
  customFilterMap,
  freezeAfter = 2,
  header,
  isGotoPageEnabled = false
}) {
  return (
    <div className={`custom-datatable divider-${freezeAfter}`}>
      {/* <Header resetScroll={resetScroll} onReset={onReset} /> */}
      <Body
        customBodyMap={customBodyMap}
        customFilterMap={customFilterMap}
        dataTableRef={dataTableRef}
        loading={loading}
        totalRecords={totalRecords}
        records={records}
        tableState={tableState}
        onPage={onPage}
        onSort={onSort}
        onFilter={onFilter}
        columns={columns}
        header={header}
        isGotoPageEnabled={isGotoPageEnabled}
      />
    </div>
  );
}

KTransactionTable.propTypes = {
  dataTableRef: PropTypes.object,
  loading: PropTypes.bool,
  totalRecords: PropTypes.number,
  records: PropTypes.array,
  tableState: PropTypes.object,
  onPage: PropTypes.func,
  onSort: PropTypes.func,
  onFilter: PropTypes.func,
  resetScroll: PropTypes.func,
  onReset: PropTypes.func,
  columns: PropTypes.array,
  customBodyMap: PropTypes.object,
  customFilterMap: PropTypes.object,
  freezeAfter: PropTypes.number,
};
