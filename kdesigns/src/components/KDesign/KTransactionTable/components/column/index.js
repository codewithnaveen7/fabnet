/* eslint-disable react/forbid-prop-types */
import { Column } from 'primereact/column';
import React from 'react';
import PropTypes from 'prop-types';

function ColumnBody({
  body,
  filterElement,
  showFilterMenu,
  frozen,
  align,
  field,
  header,
  filter,
  sortable,
  filterPlaceholder,
  expander,
}) {
  return (
    <Column
      expander={expander}
      style={{ minWidth: '200px' }}
      showFilterMenu={showFilterMenu}
      frozen={frozen}
      align={align}
      field={field}
      header={header}
      filter={filter}
      sortable={sortable}
      filterPlaceholder={filterPlaceholder}
      body={body}
      filterElement={filterElement}
    />
  );
}

ColumnBody.propTypes = {
  body: PropTypes.object,
  filterElement: PropTypes.object,
  showFilterMenu: PropTypes.bool,
  frozen: PropTypes.bool,
  align: PropTypes.string,
  field: PropTypes.string,
  header: PropTypes.string,
  filter: PropTypes.bool,
  sortable: PropTypes.bool,
  expander: PropTypes.bool,
  filterPlaceholder: PropTypes.string,
};
export default ColumnBody;
