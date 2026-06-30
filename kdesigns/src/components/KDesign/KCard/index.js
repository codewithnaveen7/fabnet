import React from 'react';
import { Card } from 'primereact/card';
export default function KCard({className,footer,children,style,title,pt,header}) {
  return (<Card 
           className={className} 
           footer={footer} 
           style={style} 
           title={title}
           pt={pt}
           header={header}
           >
        {children}
  </Card>)
}
