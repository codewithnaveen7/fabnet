import React from "react";
import { useLocation } from "react-router-dom";

export default function SidebarNav({ items }) {
  const location = useLocation();

  return (
    <nav className="fn-nav">
      {items.map((section, idx) => (
        <div key={section.label || idx}>
          {section.label ? (
            <div className="fn-nav-section">{section.label}</div>
          ) : null}
          {section.items.map((item) => {
            const active = item.path
              ? location.pathname === item.path ||
                (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
              : false;

            return (
              <button
                key={item.label}
                type="button"
                className={`fn-nav-item${active ? " active" : ""}`}
                disabled={item.disabled}
                onClick={item.command}
              >
                <i className={item.icon} />
                <span>{item.label}</span>
                {item.badge ? (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.65rem",
                      background: "rgba(255,255,255,0.15)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "6px",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SidebarUser({ user, role, roleLabel, onLogout }) {
  const displayName = user?.name || user?.email || "User";

  return (
    <div className="fn-sidebar-footer">
      <div className="fn-user-card">
        <div className="fn-user-avatar">{getInitials(displayName)}</div>
        <div style={{ minWidth: 0 }}>
          <div className="fn-user-name">{displayName}</div>
          <div className="fn-user-role">{roleLabel || role}</div>
        </div>
      </div>
      <button type="button" className="fn-nav-item" onClick={onLogout}>
        <i className="pi pi-sign-out" />
        <span>Log out</span>
      </button>
    </div>
  );
}
