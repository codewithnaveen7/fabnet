import React from 'react'
import { Image } from 'primereact/image';
import PropTypes from "prop-types";
export default function KImage({
    src = "",
    alt = "",
    width,
    height,
    preview = false,
    className = "",
    pt = {},
    downloadable,
    style
}) {
    return (
        <Image
            pt={pt}
            src={src}
            alt={alt}
            width={width}
            height={height}
            preview={preview}
            className={className}
            downloadable={downloadable}
            style={style}
        />
    )
}
KImage.propTypes = {
    src: PropTypes.string,
    className: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    alt: PropTypes.string,
    preview: PropTypes.bool,
    pt: PropTypes.object,
    downloadable: PropTypes.bool,
};
