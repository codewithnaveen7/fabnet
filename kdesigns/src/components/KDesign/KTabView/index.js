import React, { useCallback } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';


export const  KTabView=({ dataSource = [], renderContent, renderHeaderTemplate,className='',activeIndex=0 ,...props})=> {
  const renderCustomHeader = useCallback((options, tab) => (
    <span
      style={{ backgroundColor: 'none !important' }}
      onClick={options.onClick}
      className={options.className}
    >
      {options.titleElement}
      {renderHeaderTemplate(tab)}
    </span>
  ), [renderHeaderTemplate]);
 
  return (
      <TabView activeIndex={activeIndex} className={`KTabs ${className}`} {...props}>
        {dataSource.map((tab) => (
          <TabPanel key={tab.id} header={tab.header} headerTemplate={(options) => renderCustomHeader(options, tab)}
          {...tab}
          >
            {renderContent(tab)}
          </TabPanel>
        ))}
      </TabView>
   
  );
}


KTabView.defaultProps = {
    renderContent: () => (<></>),
    renderHeaderTemplate:()=>(<></>)
  };