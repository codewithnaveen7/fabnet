
import React, { useState } from 'react'
// Todo : move it to Kdesigns
const KLongText = ({ content, limit, showTooltip }) => {
    const [showAll, setShowAll] = useState(false);

    const showMore = () => setShowAll(true);
    const showLess = () => setShowAll(false);

    if (content?.length <= limit) {
        // there is nothing more to show
        return <div style={{ "overflowWrap": "break-word" }}>{content}{" "}</div>
    }
    if (showAll) {
        // We show the extended text and a link to reduce it
        return <div style={{ "overflowWrap": "break-word" }}>
            {content}{" "}
            <a href='#' onClick={showLess} className='pi pi-angle-down' style={{ color: 'var(--primary-color)', fontSize: '1.5rem', textDecoration: 'none' }}></a>
        </div>
    }
    // In the final case, we show a text with ellipsis and a `Read more` button
    const toShow = content ? content.substring(0, limit) + "..." : "";
    return <div title={showTooltip ? content : ''}>
        {toShow}
        {
            !showTooltip &&
            <a href="#" onClick={showMore} className='pi pi-angle-right' style={{ color: 'var(--primary-color)', fontSize: '1.5rem', textDecoration: 'none' }}></a>
        }
    </div>
}

export default KLongText;