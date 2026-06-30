import React, { Suspense, lazy } from "react";
import "./styles/dashboard.css";

const RemoteApp = lazy(() => import("./RemoteApp"));

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        color: "#444",
      }}
    >
      Loading FabNet…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RemoteApp />
    </Suspense>
  );
}
