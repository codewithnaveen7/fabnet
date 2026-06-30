import React from 'react'
import { Galleria } from 'primereact/galleria';

export const KGalleria=({
    value ,
    showItemNavigators,
    style,
    item ,
    showThumbnails=false,
    showIndicators=true,
    activeIndex ,
    onItemChange ,
    indicatorsPosition="top",
    pt
}) =>{
    return (
        <Galleria
        value={value}
        showItemNavigators={showItemNavigators}
        style={style}
        item={item}
        showThumbnails={showThumbnails}
        showIndicators={showIndicators}
        activeIndex={activeIndex}
        onItemChange={onItemChange}
        indicatorsPosition={indicatorsPosition}
        pt={pt}
  
      />
    )
}

