import React from 'react'
import { Tooltip } from 'primereact/tooltip';
import PropTypes from "prop-types";
export default function KTooltip({
    target = "",
    mouseTrack = false,
    mouseTrackLeft = 10,
    position = "left",
    disabled = false,
    pt = {},
    children,
    className="",
    autoHide=true,
    tooltipRef,
    id,
    appendTo
}) {
    return (
        <Tooltip
        pt={pt}
        target={target}
        position={position}
        disabled={disabled}
        className={className}
        mouseTrack={mouseTrack}
        mouseTrackLeft={mouseTrackLeft}
        autoHide={autoHide}
        ref={tooltipRef}
        id={id}
        appendTo={appendTo}
        >
            {children}
        </Tooltip>
    )
}
KTooltip.propTypes = {
    target: PropTypes.string,
    mouseTrack: PropTypes.bool,
    mouseTrackLeft: PropTypes.number,
    position: PropTypes.string,
    pt: PropTypes.object,
    disabled: PropTypes.bool,
    autoHide: PropTypes.bool,
    className:PropTypes.string
};
