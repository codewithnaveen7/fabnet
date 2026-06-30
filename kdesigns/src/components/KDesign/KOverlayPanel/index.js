import React from "react";
import { OverlayPanel } from 'primereact/overlaypanel';

const KOverlayPanel = ({children,panelRef,...rest}) => {
 
    return ( 
        <OverlayPanel ref={panelRef}  {...rest}>
            {children}
        </OverlayPanel>
     );
}
 
export default KOverlayPanel;