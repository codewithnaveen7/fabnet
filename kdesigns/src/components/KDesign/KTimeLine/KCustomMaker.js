import React from 'react';

export const KCustomMaker=({className='',children,width="2rem" ,height="2rem"})=>{
return <span style={{width,height}} className={`flex align-items-center justify-content-center border-circle z-1 shadow-1 border-2 border-solid border-primary ${className}`} >
    {children}
</span>
    }