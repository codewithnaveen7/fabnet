import React from "react";
import { PrimeReactProvider } from "primereact/api";

function KPrimeReactProvider({ children }) {
  return <PrimeReactProvider>{children}</PrimeReactProvider>;
}

export default KPrimeReactProvider;
