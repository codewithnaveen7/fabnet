import React from 'react';
import { FileUpload } from 'primereact/fileupload';

function KFileUpload({fileUploadRef, ...props}) {
    return <FileUpload ref={fileUploadRef} {...props} />;
}

export default KFileUpload;
