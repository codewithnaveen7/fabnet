import { classNames } from 'primereact/utils'
import React from 'react'
import { Avatar } from 'primereact/avatar';
import PropTypes from "prop-types";
export const KAvatar = ({
  icon, className, size = "", pt, label, onClick,shape,image,containerClass='',style,containerStyle={}
  // We are not going to use rest for now
}) => {
  return (
    <div className={containerClass} style={containerStyle}>
      <Avatar
        icon={icon}
        size={size}
        pt={pt}
        onClick={onClick}
        label={label}
        className={classNames("border-circle", className)}
        shape={shape}
        image={image} 
        style={style}

      />
    </div>
  )
}
KAvatar.defaultProps = {
  icon: "",
  className: "",
  size: "",
  pt: {},
  label: "",
  onClick: () => { },
};
KAvatar.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
  onClick: PropTypes.func,
  pt: PropTypes.object,
  label: PropTypes.string
};
