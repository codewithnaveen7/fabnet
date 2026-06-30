import React, { useState, useEffect } from 'react';
import { formatDistanceStrict } from 'date-fns';

function RelativeTime({ timestamp, className='' }) {
  const [relativeTime, setRelativeTime] = useState(null);

  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime(
        formatDistanceStrict(new Date(timestamp), new Date(), {
          addSuffix: true,
        }),
      );
    };

    updateRelativeTime();

    const intervalId = setInterval(updateRelativeTime, 8000);

    return () => clearInterval(intervalId);
  }, [timestamp]);

  return (
    <span className={className}>
      {relativeTime
        ?.replace(/^0 seconds ago$/, 'just now')
        ?.replace('seconds', 'secs')}
    </span>
  );
}

export default RelativeTime;
