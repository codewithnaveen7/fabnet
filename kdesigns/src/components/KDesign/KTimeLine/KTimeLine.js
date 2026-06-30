import React from 'react';
import { Timeline } from 'primereact/timeline';
import './timeline.scss';

function KTimeLine({
  className = '', pt, opposite, content, value, onAddClick, onUpdateClick, marker,addFirstLeg=true,isAscOrder,layout="vertical"
}) {
  return (
<section className={`p-timeline-container ${className}`}>
     {(value?.length && addFirstLeg) ? <span className='addFirstLeg'><i className="pi pi-plus-circle" onClick={() => onAddClick(value[0],isAscOrder,-1)} /></span> : null } 
    <Timeline
      value={value}
      
      pt={{
        
        marker: { style: { width: '2rem', height: '2rem' }, className: 'border-primary' },
        event: {
          onMouseEnter: (e) => {
            e.currentTarget.classList.add('hovered');
          },
          onMouseLeave: (e) => {
            e.currentTarget.classList.remove('hovered');
          },
        },
        separator: {
          onMouseEnter: (e) => {
            e.currentTarget.classList.add('showAddBtn');
          },
          onMouseLeave: (e) => {
            e.currentTarget.classList.remove('showAddBtn');
          },

        },
        ...(pt || {}),
      }}
      opposite={opposite}
      content={(item) => (
        <>
          {onUpdateClick && <i className="pi pi-pencil edit" onClick={() => onUpdateClick(item)} />}
          {content(item)}
        </>
      )}

      marker={(item,index) => (
        <>
          
            { marker && marker(item)}
          
          { onAddClick && <i className="pi pi-plus-circle" onClick={() => onAddClick(item,(index==value.length-1) && !isAscOrder,index)} />}
           {/* if order is reverse then isStartingFlag is true */}
        </>
      )}
      layout={layout}
    />
</section>
  );
}

export default React.memo(KTimeLine);
