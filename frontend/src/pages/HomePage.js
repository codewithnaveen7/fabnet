import React from "react";
import { useSelector } from "react-redux";
import "kdesigns/kDesignStyle";
import { selectRole, selectUser } from "../store/authSlice";
import "../styles/dashboard.css";

const welcomeByRole = {
  ADMIN:
    "Manage suppliers, clients, and platform operations from a single control center.",
  SUPPLIER:
    "Track your manufacturing services, company profile, and client connections.",
};

function StatCard({ icon, iconClass, label, value }) {
  return (
    <div className="fn-stat-card">
      <div className={`fn-stat-icon ${iconClass}`}>
        <i className={icon} />
      </div>
      <div className="fn-stat-label">{label}</div>
      <div className="fn-stat-value">{value}</div>
    </div>
  );
}

export default function HomePage() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const name = user?.name || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const services = user?.supplierProfile?.services?.length ?? 0;
  const company = user?.supplierProfile?.companyName;

  return (
    <div>
      <section className="fn-hero">
        <h2>Welcome back, {name}</h2>
        <p>{welcomeByRole[role] || "Welcome to FabNet Systems."}</p>
        <div className="fn-hero-meta">
          <span className="fn-hero-pill">
            <i className="pi pi-calendar mr-2" />
            {today}
          </span>
          <span className="fn-hero-pill">
            <i className="pi pi-shield mr-2" />
            {role === "ADMIN" ? "Admin Access" : "Supplier Access"}
          </span>
        </div>
      </section>

      <div className="fn-stat-grid">
        <StatCard
          icon="pi pi-id-card"
          iconClass="blue"
          label="Your Role"
          value={role === "ADMIN" ? "Administrator" : "Supplier"}
        />
        <StatCard
          icon="pi pi-check-circle"
          iconClass="green"
          label="Account Status"
          value={user?.status === "ACTIVE" ? "Active" : user?.status || "—"}
        />
        {role === "SUPPLIER" ? (
          <>
            <StatCard
              icon="pi pi-building"
              iconClass="purple"
              label="Company"
              value={company || "Not set"}
            />
            <StatCard
              icon="pi pi-cog"
              iconClass="amber"
              label="Active Services"
              value={`${services} service${services !== 1 ? "s" : ""}`}
            />
          </>
        ) : (
          <StatCard
            icon="pi pi-envelope"
            iconClass="purple"
            label="Email"
            value={user?.email || "—"}
          />
        )}
      </div>

      <div className="fn-panel">
        <div className="fn-panel-header">
          <h3>Getting started</h3>
        </div>
        <div className="fn-panel-body">
          <ul className="fn-quick-list">
            <li>
              <i className="pi pi-user-edit" />
              <span>
                Complete your profile with up-to-date contact information.
              </span>
            </li>
            <li>
              <i className="pi pi-compass" />
              <span>
                Use the sidebar to navigate between dashboard sections.
              </span>
            </li>
            <li>
              <i className="pi pi-lock" />
              <span>
                Change your password regularly from the Profile page.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
