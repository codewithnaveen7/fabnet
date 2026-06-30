import React from "react";
import { Slider } from "primereact/slider";
import "primeicons/primeicons.css";
import "./KSlider.scss";

const KSlider = ({
    value,
    onChange,
    min = 0,
    max = 10,
    step = 1,
    showValue = false,
    className = "",
    style = {},
    disabled = false,
    orientation = "vertical",
    onRotateLeft,
    onRotateRight,
    sliderHeight = 120,
    sliderWidth = 40,
}) => {
    const isVertical = orientation === "vertical";

    return (
        <div className={`zoom-slider-container ${className}`} style={style}>

            <div
                className="zoom-slider-btn"
                onClick={() => !disabled && onChange(value + step)}
            >
                <i className="pi pi-plus" />
            </div>

            <div
                className="slider-container"
                style={{
                    height: isVertical ? sliderHeight : "auto",
                    width: !isVertical ? sliderWidth : "auto",
                }}
            >
                <Slider
                    value={value}
                    onChange={(e) => onChange(e.value)}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    orientation={orientation}
                    style={{
                        height: isVertical ? "100%" : undefined,
                        width: !isVertical ? "100%" : undefined,
                    }}
                />
            </div>

            <div
                className="zoom-slider-btn"
                onClick={() => !disabled && onChange(value - step)}
            >
                <i className="pi pi-minus" />
            </div>

            <div className="rotation">
                <div className="left-rotation" onClick={onRotateLeft}>
                    <i className="pi pi-undo"></i>
                </div>
                <div className="right-rotation" onClick={onRotateRight}>
                    <i className="pi pi-refresh"></i>
                </div>
            </div>

            {showValue && <div className="value-display">{value}</div>}
        </div>
    );
};

export default KSlider;
