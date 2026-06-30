import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import React from 'react';

function KSearchBar() {
  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <Dropdown
        placeholder="All"
        style={{
          borderRight: '0',
          borderRadius: '5px 0 0 5px',
          background: '#F5F5F5',
          width: '80px',
        }}
      />
      <InputText
        placeholder="Search"
        size="small"
        style={{ width: '100%', borderRadius: '0' }}
      />
      <Button icon="pi pi-search" style={{ borderRadius: '0 5px 5px 0' }} />
    </div>
  );
}

export default KSearchBar;
