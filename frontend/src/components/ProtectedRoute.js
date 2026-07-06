import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { KProgressSpinner } from "kdesigns/KDesign";
import {
  selectAuthBootstrapping,
  selectIsAuthenticated,
} from "../store/authSlice";

function AuthLoadingScreen() {
  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <KProgressSpinner />
    </div>
  );
}

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const bootstrapping = useSelector(selectAuthBootstrapping);
  const location = useLocation();

  if (bootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
