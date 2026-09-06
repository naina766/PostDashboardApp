import React from "react";

export default function PageHeader({ title, description, children, className = "" }) {
  return (
    <header className={`ph-page-header mb-4 ${className}`}>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="ph-page-title mb-1">{title}</h1>
          {description && (
            <p className="ph-page-description mb-0">{description}</p>
          )}
        </div>
        {children && (
          <div className="ph-page-header-actions d-flex align-items-center gap-2 flex-wrap">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
