import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import "kdesigns/kDesignStyle";
import SidebarNav, { SidebarUser } from "../components/SidebarNav";
import { logout, selectRole, selectUser } from "../store/authSlice";
import "../styles/dashboard.css";

const roleLabels = { ADMIN: "Administrator", SUPPLIER: "Supplier Partner" };

function buildNavSections(role, navigate) {
  const main = {
    items: [
      {
        label: "Dashboard",
        icon: "pi pi-th-large",
        path: "/dashboard",
        command: () => navigate("/dashboard"),
      },
      {
        label: "Profile",
        icon: "pi pi-user",
        path: "/dashboard/profile",
        command: () => navigate("/dashboard/profile"),
      },
    ],
  };

  if (role === "ADMIN") {
    return [
      main,
      {
        label: "Management",
        items: [
          {
            label: "Clients",
            icon: "pi pi-building",
            disabled: true,
            badge: "Soon",
            command: () => {},
          },
          {
            label: "RFQs",
            icon: "pi pi-file",
            path: "/dashboard/rfqs",
            command: () => navigate("/dashboard/rfqs"),
          },
          {
            label: "Services",
            icon: "pi pi-list",
            path: "/dashboard/services",
            command: () => navigate("/dashboard/services"),
          },
          {
            label: "Suppliers",
            icon: "pi pi-users",
            path: "/dashboard/suppliers",
            command: () => navigate("/dashboard/suppliers"),
          },
        ],
      },
    ];
  }

  if (role === "SUPPLIER") {
    return [
      main,
      {
        label: "Business",
        items: [
          {
            label: "My RFQs",
            icon: "pi pi-file",
            path: "/dashboard/rfqs",
            command: () => navigate("/dashboard/rfqs"),
          },
          {
            label: "My Company",
            icon: "pi pi-briefcase",
            disabled: true,
            badge: "Soon",
            command: () => {},
          },
          {
            label: "My Services",
            icon: "pi pi-cog",
            disabled: true,
            badge: "Soon",
            command: () => {},
          },
        ],
      },
    ];
  }

  return [main];
}

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const navigate = useNavigate();
  const sections = useMemo(() => buildNavSections(role, navigate), [role, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="fn-app">
      <aside className="fn-sidebar">
        <div className="fn-sidebar-brand">
          <h1>FabNet</h1>
          <p>Systems Platform</p>
        </div>
        <SidebarNav items={sections} />
        <SidebarUser
          user={user}
          role={role}
          roleLabel={roleLabels[role]}
          onLogout={handleLogout}
        />
      </aside>
      <main className="fn-main">
        <Outlet />
      </main>
    </div>
  );
}
