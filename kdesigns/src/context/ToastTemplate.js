import React from "react";

function ToastTemplate({ children, icon }) {
  if (icon)
    return (
      <div className="w-full h-full flex align-items-center">
        <div className="flex align-items-center">
          <i className={`${icon} text-5xl mr-3`} />
          {children}
        </div>
      </div>
    );
  return children;
}

export default ToastTemplate;
