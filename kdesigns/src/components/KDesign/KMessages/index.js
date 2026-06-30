import React, {useRef} from "react";
import { useMountEffect } from 'primereact/hooks';
import { Messages } from 'primereact/messages';


const KMessages = ({messages}) => {
    const KMessageRef = useRef();

    useMountEffect(() => {
        if (KMessageRef.current) {
            KMessageRef.current.clear();
            KMessageRef.current.show(messages);
        }
    })
    return ( 
        <Messages ref={KMessageRef}/>
     );
}
 
export default KMessages;