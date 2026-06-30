import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import './style.scss';
export default function KProgressSpinner({ show = false,className='',style }) {
  return show ? <ProgressSpinner className={className} style={style}  /> : null;
}
