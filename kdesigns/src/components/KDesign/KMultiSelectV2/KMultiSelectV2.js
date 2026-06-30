import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";
import { KCheckbox, KInputText } from "../index";
import { lowerCase } from "lodash";

const KMultiSelectV2 = ({
  options = [],
  maxSelectedLabels = 3,
  value = [],
  handleChange = () => {},
  panelFooterTemplate = null,
  overlayVisible: overlayVisibleProp,
  onFocus = () => {},
  onHide = () => {},
  onBlur,
  disabled,
  name,
  template,
}) => {
  // State variables
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  // Toggle show options
  const toggleShowOptions = () => {
    setShowOptions(!showOptions);
    setSearch("");
    if (!overlayVisible) onFocus();
    else onHide();
  };

  // Handle select all options
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const excludeDisabled = options.filter((option) => !option.isDisabled);
      handleChange(excludeDisabled);
      return;
    }
    handleChange([]);
  };

  // Toggle individual option selection
  const toggleOption = (option, e) => {
    if (option.isDisabled) return;
    if (e.target.checked) {
      handleChange([...value, option]);
    } else {
      handleChange(value.filter((opt) => opt.code !== option.code));
    }
  };

  // Close overlay
  const onClose = () => {
    onHide();
    setShowOptions(false);
  };

  // Determine overlay visibility
  const overlayVisible =
    overlayVisibleProp !== undefined ? overlayVisibleProp : showOptions;

  useEffect(() => {
    if (dropdownRef.current) {
      const dropdownBottomSpace =
        window.innerHeight - dropdownRef.current.getBoundingClientRect().bottom;
      const dropdownTopSpace = dropdownRef.current.getBoundingClientRect().top;
      if (dropdownBottomSpace < 200 && dropdownTopSpace > 200) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [overlayVisible]);

  return (
    <div className="k-multi-select-dropdown">
      <span className="p-input-icon-right w-full" ref={dropdownRef}>
        <i className="pi pi-angle-down" style={{ fontSize: "1.2rem" }} />
        <KInputText
          autoComplete="off"
          name={name}
          onChange={() => {}}
          onClick={toggleShowOptions}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full"
          style={{ cursor: "pointer", caretColor: "transparent" }}
          value={
            value.length > maxSelectedLabels
              ? `${value.length} items selected`
              : value.map((option, index) => {
                  const optionObj = options.find(
                    (opt) => opt.code === option.code
                  );
                  return ` ${optionObj?.name}`;
                })
          }
        />
      </span>
      {overlayVisible && (
        <div
          className="k-multi-select-dropdown__options-container"
          style={{ bottom: dropdownPosition === "top" ? "100%" : "" }}
        >
          <div className="k-multi-select-dropdown__header">
            <KCheckbox
              checked={
                value?.length &&
                options.filter((option) => !option.isDisabled)?.length ===
                  value?.length
              }
              type="checkbox"
              className="k-multi-select-dropdown__option-checkbox"
              onChange={handleSelectAll}
            />
            <span className="p-input-icon-right w-full">
              <i className="pi pi-search" />
              <KInputText
                autoFocus
                className="w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </span>
            <i
              onClick={onClose}
              className="pi pi-times"
              style={{ cursor: "pointer", paddingLeft: "0.5rem" }}
            ></i>
          </div>
          <div className="k-multi-select-dropdown__options">
            {options?.length
              ? options
                  ?.filter((opt) =>
                    lowerCase(opt?.name).includes(lowerCase(search))
                  )
                  ?.map((option) => {
                    const isSelected = value.find((s) => s.code === option.code)
                      ? true
                      : false;

                    return (
                      <div
                        key={option.code}
                        className="k-multi-select-dropdown__option"
                        onClick={() =>
                          toggleOption(option, {
                            target: {
                              checked: !isSelected,
                            },
                          })
                        }
                      >
                        <KCheckbox
                          disabled={option?.isDisabled}
                          type="checkbox"
                          checked={isSelected}
                          className="k-multi-select-dropdown__option-checkbox"
                          onChange={(e) => toggleOption(option, e)}
                        />
                        {template ? (
                          template({
                            ...option,
                            text: option?.name,
                            value: option?.code,
                            isDisabled: option.isDisabled,
                            tooltip: option?.tooltip,
                          })
                        ) : (
                          <span>{option.name}</span>
                        )}
                      </div>
                    );
                  })
              : null}
          </div>
          <div className="k-multi-select-dropdown__footer">
            {panelFooterTemplate}
          </div>
        </div>
      )}
    </div>
  );
};

export default KMultiSelectV2;
