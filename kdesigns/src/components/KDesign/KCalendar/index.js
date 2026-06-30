import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Calendar } from "primereact/calendar";
const KCalendar = (props)=> {
  const {
    showButtonBar,
    value,
    onChange,
    placeholder,
    style,
    showIcon = false,
    iconPos = "right",
    className = "",
    appendTo,
    field,
    dateFormat,
    name,
    showTime,
    hourFormat,
    showSeconds,
    disabled,
    minDate,
    readOnlyInput,
    selectionMode="single",
    onSelect,
    onKeyDown=()=>{},
    maxDate
  } = props;
  const cal = useRef(null);
  const inputRef=useRef(null)
  return (
    <Calendar
      ref={cal}
      showButtonBar={showButtonBar}
      value={value}
      onChange={(e)=>onChange(e, cal)}
      placeholder={placeholder}
      style={style}
      showIcon={showIcon}
      appendTo={appendTo}
      iconPos={iconPos}
      dateFormat={dateFormat}
      className={className}
      name={name}
      showTime={showTime}
      hourFormat={hourFormat}
      showSeconds={showSeconds}
      disabled={disabled}
      hideOnDateTimeSelect
      minDate={minDate}
      headerTemplate={(e) => <div className="header-calendar absolute top-0 cursor-pointer" style={{right:'.5rem'}} ><i className="pi pi-times-circle text-base" onClick={cal?.current?.hide}></i></div>}
      readOnlyInput={readOnlyInput}
      selectionMode={selectionMode}
      hideOnRangeSelection={true}
      onSelect={onSelect}
      inputRef={inputRef}
      onHide={()=>inputRef.current?.blur()}
      onKeyDown={(e)=>{
        onKeyDown(e, cal)
      }}
      {...field}
      maxDate={maxDate}
    />
  );
}
KCalendar.propTypes = {
  showButtonBar: PropTypes.bool,
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  iconPos: PropTypes.string,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
};
export default KCalendar;
