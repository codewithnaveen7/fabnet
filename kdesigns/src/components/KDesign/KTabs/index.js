import { TabPanel, TabView } from "primereact/tabview";
import { Tag } from "primereact/tag";
import React from "react";


function KTabs({
  items = [],
  activeIndex = 0,
  onSelect,
  countKey = "count",
  labelKey = "label",
}) {
  const titleWithCount = (options, count) => (
    <span
      style={{ backgroundColor: "none !important" }}
      onClick={options.onClick}
      className={options.className}
    >
      {options.titleElement} &nbsp;&nbsp;{" "}
      {count ? <Tag rounded value={count} /> : null}
    </span>
  );
  return (
    <TabView
      onTabChange={(tab) => onSelect(tab.index)}
      activeIndex={activeIndex}
      className="KTabs"
    >
      {items?.length
        ? items?.map((item) => (
            <TabPanel
              key={item[labelKey]}
              header={item[labelKey]}
              headerTemplate={(options) =>
                titleWithCount(options, item[countKey])
              }
            />
          ))
        : null}
    </TabView>
  );
}

export default KTabs;
