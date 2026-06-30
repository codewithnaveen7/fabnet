import React from "react";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
      <div>
        <h1 className="text-3xl font-bold text-900 m-0">{title}</h1>
        {subtitle ? <p className="text-600 mt-2 mb-0">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-2 flex-wrap">{actions}</div> : null}
    </div>
  );
}
