import React from "react";
import PropTypes from "prop-types";
import { Panel } from "primereact/panel";
function KPanel(props) {
  const { children = <></>, header = "", className = "", ...restProps } = props;
  return (
    <Panel header={header} className={className} {...restProps}>
      {children}
    </Panel>
  );
}
KPanel.propTypes = {
  children: PropTypes.element,
  header: PropTypes.any,
  className: PropTypes.string,
};
export default KPanel;
