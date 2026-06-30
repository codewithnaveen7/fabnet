import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import KLoadingIcon from "../KLoadingIcon";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import './style.scss'

function KCommonTable({
  filterMap,
  bodyMap,
  columns,
  headerColumnGroup = false,
  highlightedColumnList=[],
  dataKey="id",
  skeleton,
  ...rest
}) {
  const headerGroup = (
    <ColumnGroup>
      <Row>
  
        {rest?.headerGroupArray?.map((item,index) => {
       
          return <Column
            key={item.title}
            header={item.title}
            colSpan={item.colSpan}
            frozen={item?.frozen}
            alignFrozen={item?.alignFrozen}
          />;
        })}
      </Row>
      <Row>
      {columns.map(
        (
          { filterElement, body, customBodyProps, customFilterProps, ...rest },
          index
        ) => {
          const bodyTemplate = bodyMap?.[body] || null;
          const filterTemplate = filterMap?.[filterElement] || null;

          return (
            <Column
              {...rest}
              filterElement={
                filterTemplate
                  ? (data, options) =>
                      filterTemplate(data, options, customFilterProps)
                  : null
              }
              body={
                bodyTemplate
                  ? (data, options) =>
                      bodyTemplate(data, options, customBodyProps)
                  : null
              }
              headerClassName={highlightedColumnList.length>0 && highlightedColumnList.includes(rest.field) && 'header-label'}
              key={`tableColumn${index}`}
            />
          );
        }
      )}

      </Row>
    </ColumnGroup>
  );
  return (
    <DataTable
      {...rest}
      headerColumnGroup={headerColumnGroup && headerGroup }
      loadingIcon={<KLoadingIcon />}
      dataKey={dataKey}
    >
      {columns.map(
        (
          { filterElement, body, customBodyProps, customFilterProps,isInfo=false, ...rest },
          index
        ) => {
          const bodyTemplate = bodyMap?.[body] || null;
          const filterTemplate = filterMap?.[filterElement] || null;

          return (
            <Column
              {...rest}
              header = {isInfo ? rest.infoHeader : rest.header}
              filterElement={
                filterTemplate
                  ? (data, options) =>
                      filterTemplate(data, options, customFilterProps)
                  : null
              }
              body={skeleton ? skeleton :
                bodyTemplate
                  ? (data, options) =>
                      bodyTemplate(data, options, customBodyProps)
                  : null
              }
              key={`tableColumn${index}`}
            />
          );
        }
      )}
    </DataTable>
  );
}

export default KCommonTable;

KCommonTable.propTypes = {
  size: PropTypes.string,
  first: PropTypes.number,
  showGridlines: PropTypes.bool,
  filterDelay: PropTypes.string,
  currentPageReportTemplate: PropTypes.string,
  paginatorTemplate: PropTypes.string,
  value: PropTypes.array,
  lazy: PropTypes.bool,
  removableSort: PropTypes.bool,
  filterDisplay: PropTypes.string,
  paginator: PropTypes.bool,
  rows: PropTypes.number,
  totalRecords: PropTypes.number,
  onPage: PropTypes.number, // function to envoke on change of page
  onSort: PropTypes.func,
  sortField: PropTypes.string,
  sortOrder: PropTypes.string,
  onFilter: PropTypes.func,
  filters: PropTypes.object,
  loading: PropTypes.bool,
  tableStyle: PropTypes.object,
  scrollable: PropTypes.bool,
  rowsPerPageOptions: PropTypes.array,

};