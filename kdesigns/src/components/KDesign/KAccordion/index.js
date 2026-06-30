import React from "react";
import { Accordion, AccordionTab } from "primereact/accordion";

export default function KAccordion({
  multiple = false,
  onTabChange = null,
  tabs = [],
  activeIndex = 0,
  renderHeaderTemplate = null,
  renderContentTemplate = null,
  containerClassName = "card",
  className,
  ...rest
}) {
  const dynamicAccordianProps = {};
  if (typeof onTabChange === "function") {
    dynamicAccordianProps.activeIndex = activeIndex;
    dynamicAccordianProps.onTabChange = onTabChange;
  }
  return (
    <div className={containerClassName}>
      <Accordion
        {...dynamicAccordianProps}
        multiple={multiple}
        className={className}
      >
        {tabs.map((tab, i) => {
          return (
            <AccordionTab
              key={tab.header}
              headerTemplate={
                renderHeaderTemplate
                  ? (options) => renderHeaderTemplate(options, tab, i)
                  : false
              }
              header={tab.header}
              disabled={tab.disabled}
              {...rest}
            >
              {typeof renderContentTemplate === "function"
                ? renderContentTemplate(tab, i)
                : tab.children}
            </AccordionTab>
          );
        })}
      </Accordion>
    </div>
  );
}
