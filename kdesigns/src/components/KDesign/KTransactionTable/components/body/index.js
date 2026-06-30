/* eslint-disable no-prototype-builtins */
/* eslint-disable indent */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { DataTable } from "primereact/datatable";
import KLoadingIcon from "../../../KLoadingIcon";
import ColumnBody from "../column";
import { InputNumber } from "primereact/inputnumber";

function Body({
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
  header
}) {

  const [jumpPage, setJumpPage] = useState('');

  const onJump = React.useCallback((pageNumber) => {
    if (!isNaN(pageNumber)) {
      onPage({ first: (pageNumber - 1) * tableState?.rows || 0 });
      setJumpPage('');
    }
  }, [onPage, totalRecords, tableState?.rows]);

  const paginatorTemplate = React.useMemo(() => ({
    layout: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageInput CurrentPageReport RowsPerPageDropdown",
    JumpToPageInput: (options) => {
      return (
        <span className="p-inputgroup mx-2" style={{ width: '80px' }}>
          <InputNumber
            value={jumpPage ||''}
            onValueChange={(e) => setJumpPage(e.value || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onJump(Number(e?.target?.value), options);
              }
            }}
            min={1}
            max={Math.ceil(totalRecords / tableState?.rows)}
            useGrouping={false}
            placeholder="Page"
            className="page-number-input"
          />
        </span>
      );
    }
  }), [loading, totalRecords, onJump, jumpPage, tableState?.rows]);

  return (
    <DataTable
      header={header}
      size="small"
      first={tableState?.first}
      ref={dataTableRef}
      pt={{
        root: {
          className: "k-transaction-table__body"
        },
        paginator: {
          root: {
            className: "k-custom-paginator"
          }
        },
        loadingOverlay: {
          style: {
            zIndex: "4",
            backgroundColor: "#ffffff96",
          },
        },
      }}
      loadingIcon={<KLoadingIcon />}
      filterDelay="1000"
      rowsPerPageOptions={[25, 50, 100, 200]}
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
      paginatorTemplate={paginatorTemplate}
      value={records}
      lazy
      removableSort
      filterDisplay="row"
      dataKey="id"
      paginator
      rows={tableState?.rows}
      totalRecords={totalRecords}
      onPage={(event) => {
        onPage(event);
        setJumpPage('');
      }}
      onSort={onSort}
      sortField={tableState?.sortField}
      sortOrder={tableState?.sortOrder}
      onFilter={onFilter}
      filters={tableState?.filters}
      loading={loading}
      tableStyle={{ minWidth: "75rem" }}
      scrollable
    >
      {Array.isArray(columns)
        ? columns.map(
          (
            {
              showFilterMenu,
              frozen,
              align,
              field,
              header,
              filter,
              sortable,
              filterPlaceholder,
              customBody,
              customBodyProps,
              customFilterProps,
              customFilter,
              expander,
            },
            index
          ) => {
            const body =
              customBodyMap && customBodyMap.hasOwnProperty(customBody)
                ? customBodyMap[customBody]
                : customBodyMap.default;
            const filterElement =
              customFilterMap && customFilterMap.hasOwnProperty(customFilter)
                ? customFilterMap[customFilter]
                : null;
            return (
              <ColumnBody
                key={index}
                body={
                  body
                    ? (data, options) => body(data, options, customBodyProps)
                    : undefined
                }
                filterElement={
                  filterElement
                    ? (options) => filterElement(options, customFilterProps)
                    : undefined
                }
                showFilterMenu={showFilterMenu}
                frozen={frozen}
                align={align}
                field={field}
                header={header}
                filter={filter}
                sortable={sortable}
                filterPlaceholder={filterPlaceholder}
                customBody={customBody}
                customBodyProps={customBodyProps}
                customFilterProps={customFilterProps}
                expander={expander}
              />
            );
          }
        )
        : null}
    </DataTable>
  );
}

Body.propTypes = {
  dataTableRef: PropTypes.object,
  loading: PropTypes.bool,
  totalRecords: PropTypes.number,
  records: PropTypes.array,
  tableState: PropTypes.object,
  onPage: PropTypes.func,
  onSort: PropTypes.func,
  onFilter: PropTypes.func,
  columns: PropTypes.array,
  customBodyMap: PropTypes.object,
  customFilterMap: PropTypes.object,
  header: PropTypes.node,
};
export default Body;
