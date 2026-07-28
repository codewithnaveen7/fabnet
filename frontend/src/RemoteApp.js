import React, { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  ToastProvider,
  KPrimeReactProvider,
  QueryProvider,
} from "kdesigns/KContext";
import { KProgressSpinner } from "kdesigns/KDesign";
import "kdesigns/kDesignStyle";
import "./lib/setupAxios";
import { store } from "./store";
import AuthInitializer from "./components/AuthInitializer";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./components/RequireRole";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const AddSupplierPage = lazy(() => import("./pages/AddSupplierPage"));
const BulkUploadSuppliersPage = lazy(() => import("./pages/BulkUploadSuppliersPage"));
const EditSupplierPage = lazy(() => import("./pages/EditSupplierPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const RfqsPage = lazy(() => import("./pages/RfqsPage"));
const AddRfqPage = lazy(() => import("./pages/AddRfqPage"));
const EditRfqPage = lazy(() => import("./pages/EditRfqPage"));
const ViewRfqPage = lazy(() => import("./pages/ViewRfqPage"));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex align-items-center justify-content-center min-h-screen">
          <KProgressSpinner />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route element={<RequireRole roles={["ADMIN", "SUPPLIER"]} />}>
              <Route path="rfqs" element={<RfqsPage />} />
              <Route path="rfqs/:id" element={<ViewRfqPage />} />
            </Route>
            <Route element={<RequireRole roles={["ADMIN"]} />}>
              <Route path="rfqs/add" element={<AddRfqPage />} />
              <Route path="rfqs/:id/edit" element={<EditRfqPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="suppliers/add" element={<AddSupplierPage />} />
              <Route path="suppliers/bulk-upload" element={<BulkUploadSuppliersPage />} />
              <Route path="suppliers/:id/edit" element={<EditSupplierPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function RemoteApp() {
  return (
    <Provider store={store}>
      <KPrimeReactProvider>
        <QueryProvider>
          <ToastProvider>
            <AuthInitializer>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthInitializer>
          </ToastProvider>
        </QueryProvider>
      </KPrimeReactProvider>
    </Provider>
  );
}
