import React, { useState } from 'react';

const KLimitedRecords = ({ records = [], recordKey, defaultRecordCount = 2, Heading,renderRecord,displayText }) => {
  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };
  return (
    <div>
      {Heading && <h2>{Heading}</h2>}

      {records.slice(0, showAll ? records.length : defaultRecordCount).map((record, index) => (
        renderRecord(record, recordKey, index, showAll)
      ))}
      {
        (records.length > defaultRecordCount) && <span onClick={toggleShowAll}>{displayText(showAll)}</span>
      }
    </div>
  );
};
KLimitedRecords.defaultProps={
  renderRecord:(record,recordKey)=><div key={recordKey ? record[recordKey] : record}>{recordKey ? record[recordKey] : record}</div>,
  displayText:(showAll)=><a href="javascript:;" style={{ color: 'var(--primary-color)', fontSize: '1rem', textDecoration: 'none' }}>{showAll ? 'less...' : 'more...'}</a>
}


export default KLimitedRecords;