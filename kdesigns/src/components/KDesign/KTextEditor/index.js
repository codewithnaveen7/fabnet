import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Editor as PrimeEditor } from "primereact/editor";

const KTextEditor = forwardRef(
  (
    {
      value,
      onTextChange,
      placeholder,
      readOnly,
      style,
      className,
      onSelectionChange,
      showHeader,
      headerTemplate,
    },
    ref
  ) => {
    return (
      <PrimeEditor
        ref={ref}
        className={className}
        placeholder={placeholder}
        value={value}
        onTextChange={onTextChange}
        readOnly={readOnly}
        style={style}
        onSelectionChange={onSelectionChange}
        showHeader={showHeader}
        headerTemplate={headerTemplate}
      />
    );
  }
);

KTextEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onTextChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  onSelectionChange: PropTypes.func,
  showHeader: PropTypes.bool,
  headerTemplate: PropTypes.node,
};

KTextEditor.defaultProps = {
  value: "",
  onTextChange: () => {},
  placeholder: "Type here...",
  readOnly: false,
  style: { height: "18rem" },
  className: "",
  onSelectionChange: () => {},
  showHeader: true,
  headerTemplate: null,
};

export default KTextEditor;
