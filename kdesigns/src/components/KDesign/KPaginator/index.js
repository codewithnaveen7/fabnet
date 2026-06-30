import { Paginator } from 'primereact/paginator';
import React from "react";
import PropTypes from "prop-types";

const KPaginator = (props) => {
  const {
    first,
    rows,
    totalRecords,
    rowsPerPageOptions,
    onPageChange,
    pt
  } = props;
  return (
    <Paginator
    first={first}
    rows={rows}
    totalRecords={totalRecords}
    rowsPerPageOptions={rowsPerPageOptions}
    onPageChange={onPageChange}
    pt={pt}
    />
  );
};

KPaginator.propTypes = {
  first: PropTypes.string,
  rows: PropTypes.string,
  totalRecords: PropTypes.string,
  rowsPerPageOptions: PropTypes.string,
  onPageChange: PropTypes.func,
};
export default KPaginator;
