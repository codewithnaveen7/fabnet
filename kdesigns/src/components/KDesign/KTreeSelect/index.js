import React from 'react';
import PropTypes from 'prop-types';
import { TreeSelect } from 'primereact/treeselect';
import { classNames } from 'primereact/utils';

function KTreeSelect({
    value,
    onChange,
    options,
    className,
    placeholder,
    selectionMode,
    name,
    onBlur,
    pt,
    style,
    id,
    metaKeySelection,
    filter,
    showClear,
    display,
    filterBy,
    filterPlaceholder,
    valueTemplate,
    disabled,
    tooltip,
    onToggle,
    onShow,
    onHide,
    onNodeUnselect,
    onNodeExpand,
    onNodeCollapse,
    onFocus
}) {
    return (
        <TreeSelect
            value={value}
            onChange={onChange}
            options={options}
            className={classNames(className)}
            placeholder={placeholder}
            name={name}
            style={style}
            pt={pt}
            selectionMode={selectionMode}
            onBlur={onBlur}
            id={id}
            metaKeySelection={metaKeySelection}
            filter={filter}
            showClear={showClear}
            display={display}
            filterBy={filterBy}
            filterPlaceholder={filterPlaceholder}
            valueTemplate={valueTemplate}
            disabled={disabled}
            tooltip={tooltip}
        />
    );
}

KTreeSelect.defaultProps = {
    pt: {},
    value: null,
    options: [],
    onChange: () => { },
    onToggle: () => { },
    onShow: () => { },
    onHide: () => { },
    onNodeUnselect: () => { },
    onNodeExpand: () => { },
    onNodeCollapse: () => { },
    onFocus:()=>{},
    style: {},
    placeholder: 'Select an option',
    selectionMode: "single",
    name: null,
    onBlur: () => { },
    metaKeySelection: true,
    filter: false,
    showClear: false,
    display: "comma",
    filterBy: "label",
    filterPlaceholder: null,
    valueTemplate: null,
    disabled: false,
    tooltip: null,
    id: null,
    className: ""
};

KTreeSelect.propTypes = {
    value: PropTypes.any,
    pt: PropTypes.object,
    style: PropTypes.object,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    options: PropTypes.array,
    className: PropTypes.string,
    name: PropTypes.string,
    selectionMode: PropTypes.string,
    placeholder: PropTypes.string,
    id: PropTypes.string,
    metaKeySelection: PropTypes.bool,
    filter: PropTypes.bool,
    showClear: PropTypes.bool,
    display: PropTypes.string,
    filterBy: PropTypes.string,
    filterPlaceholder: PropTypes.string,
    valueTemplate: PropTypes.any,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
};

export default KTreeSelect;


