import React from "react";

export default function FormSection({ icon, title, description, children, className = "" }) {
  return (
    <section className={`fn-form-section ${className}`.trim()}>
      <header className="fn-form-section-header">
        <div className="fn-form-section-icon" aria-hidden>
          <i className={icon} />
        </div>
        <div>
          <h3 className="fn-form-section-title">{title}</h3>
          {description ? <p className="fn-form-section-desc">{description}</p> : null}
        </div>
      </header>
      <div className="fn-form-section-body">{children}</div>
    </section>
  );
}
