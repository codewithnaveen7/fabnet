import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { KProgressSpinner } from "kdesigns/KDesign";
import { selectAuthLoading, selectIsAuthenticated } from "../store/authSlice";

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <KProgressSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
