import React from 'react';
import PropTypes from 'prop-types';
import './KLoadingIcon.css';

function KLoadingIcon({ size = 'small',className='' }) {
  return (
    <div className={`k-loading-icon k-loading-icon__${size} ${className}`}>
      <img
        src="/KDesign/images/logos/klearnow-icon.png"
        alt="Klearnow"
        className="k-loading-icon__image"
      />
    </div>
  );
}
KLoadingIcon.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default KLoadingIcon;
