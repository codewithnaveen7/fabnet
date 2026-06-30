/* eslint-disable react/prop-types */
import { Dialog } from 'primereact/dialog';
import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';


function KCommonModal(props) {
  const {
    visible = false,
    onHide = () => { },
    header = '',
    content = <></>,
    footer = '',
    style = { width: '50vw' },
    className = "",
    ...rest
  } = props;
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      footer={footer}
      style={style}
      className={className}
      {...rest}
    >
      {content}
    </Dialog>
  );
}
KCommonModal.propTypes = {
  onHide: PropTypes.func,
  visible: PropTypes.bool,
  header: PropTypes.any,
  content: PropTypes.any,
  className: PropTypes.string,
  style:PropTypes.object
  // eslint-disable-next-line react/forbid-prop-types
};
export default KCommonModal;
