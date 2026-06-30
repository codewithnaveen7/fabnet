import React from 'react';
import RelativeTime from './RelativeTime';
import './refreshButtonWithTime.scss';

const RefreshButtonWithTime = ({isLoading,lastRefreshTime,onRefresh,containerClass='' ,containerStyle}) => {
  return (
    <span style={containerStyle} className={`${containerClass} text-color-secondary flex align-items-center gap-2`}>
          <small onClick={onRefresh}
            className={`cursor-pointer text-xs pi pi-sync ${
                isLoading ? 'rotate-animation' : ''
            }`}
          />
          {lastRefreshTime ? (
            <RelativeTime
              timestamp={lastRefreshTime}
              
            />
          ) : "Refreshing..."}
</span>
  );
};

export default RefreshButtonWithTime;

