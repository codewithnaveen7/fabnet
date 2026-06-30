import React from 'react';
import PropTypes from 'prop-types';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';

function KInputTextarea({
  inputid = '',
  name = '',
  rows = 5,
  cols = 30,
  error = false,
  value = '',
  className = '',
  ...rest
}) {
  return (
    <InputTextarea
      {...rest}
      inputid={inputid}
      name={name}
      rows={rows}
      cols={cols}
      value={value}
      className={classNames(className, { 'p-invalid': !!error })}
    />
  );
}
KInputTextarea.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  inputid: PropTypes.string,
  rows: PropTypes.number,
  cols: PropTypes.number,
};
export default KInputTextarea;
