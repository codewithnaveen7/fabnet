import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectRole } from "../store/authSlice";

export default function RequireRole({ roles }) {
  const role = useSelector(selectRole);

  if (!roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
