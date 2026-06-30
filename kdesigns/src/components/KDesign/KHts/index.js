import React, { useState } from "react";
import HTSCodePopup from "./HtsCodePopup";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";

const CommodityField = ({
  id,
  name,
  isFormDisabled,
  serviceType,
  commodityCode,
  htsCode,
  htsBoxNumber,
  label,
  onHtsChange,
  onHtsPopupChange,
  onBlur,
  errors,
  countryOfOrigin,
  getHtsTree,
  nonSchemaErrors,
  labelClassName = "",
  className = ""
}) => {
  const country = window.shipmentCountry || countryOfOrigin;
  const [showhtspopup, setshowhtspopup] = useState(false);

  const hidehtspopup = () => {
    setshowhtspopup(false);
  };

  return (
    <div>
      <label className={labelClassName} htmlFor={name}>{label}{<span className='text-red-500'>{'*'}</span>}</label>
      <div className="hts-input relative">
        <InputText
          id={id}
          name={name}
          type="text"
          tabIndex="0"
          mandatory={false}
          boxNumber={htsBoxNumber}
          errors={errors}
          value={htsCode}
          clearInput={false}
          disabled={isFormDisabled}
          onChange={(e, data) => {
            setshowhtspopup(true);
            onHtsChange(e, data);
          }}
          onBlur={onBlur}
          className={classNames(className, { "border-red-400": ((nonSchemaErrors)) })}
        />
        <i className="pi pi-sort-amount-down text-blue-500 cursor-pointer absolute top-50"
          style={{ right: '5%', transform: 'translateY(-50%)' }} onClick={() => {
            setshowhtspopup(true)
            onHtsPopupChange(null, { name, value: htsCode });
          }}></i>
      </div>
      {nonSchemaErrors && <span className='text-red-500'>{nonSchemaErrors}</span>}
      {showhtspopup && (
        <><HTSCodePopup
          country={country}
          disabled={isFormDisabled}
          shipmentType={serviceType}
          code={commodityCode}
          mapCode={commodityCode}
          getHtsTree={getHtsTree}
          hidehtspopup={hidehtspopup}
          callbackwhenChanged={(value) => {
            value = value?.replaceAll(".", "");
            onHtsPopupChange(null, { name, value });
          }}
        /></>
      )}
    </div>
  );
};

export default CommodityField