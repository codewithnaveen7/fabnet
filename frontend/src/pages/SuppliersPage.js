import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { KButton, KColumn, KDataTable, KProgressSpinner, KTag } from "kdesigns/KDesign";
import { useQueryGet } from "kdesigns/KHooks";
import "kdesigns/kDesignStyle";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

const SUPPLIERS_STALE_MS = 1 * 60 * 1000;
const SUPPLIERS_CACHE_MS = 5 * 60 * 1000;

function statusSeverity(status) {
  return status === "ACTIVE" ? "success" : "danger";
}

function StatusTag({ status }) {
  if (!status) return "—";
  return <KTag value={status} severity={statusSeverity(status)} />;
}

export default function SuppliersPage() {
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useQueryGet({
    eventMessage: {},
    eventType: "FABNET_LIST_SUPPLIERS",
    url: "/suppliers",
    enabled: true,
    queryKey: ["suppliers", "list"],
    staleTime: SUPPLIERS_STALE_MS,
    cacheTime: SUPPLIERS_CACHE_MS,
    refetchOnWindowFocus: false,
    select: (result) => unwrapApiData(result) ?? [],
  });

  const suppliers = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((user) => ({
      id: user.id,
      companyName: user.supplierProfile?.companyName ?? "—",
      contactPerson: user.supplierProfile?.contactPerson ?? user.name,
      email: user.email,
      phone: user.phone || user.supplierProfile?.phone || "—",
      services:
        user.supplierProfile?.services?.map((s) => s.serviceType).join(", ") || "—",
      status: user.status,
    }));
  }, [data]);

  const loading = isLoading || (isFetching && !suppliers.length);

  return (
    <div>
      <div className="fn-page-header">
        <div>
          <h1 className="fn-page-title">Suppliers</h1>
          <p className="fn-page-subtitle mb-0">
            View and manage supplier partners on the platform.
          </p>
        </div>
        <KButton
          label="Add supplier"
          icon="pi pi-plus"
          onClick={() => navigate("/dashboard/suppliers/add")}
        />
      </div>

      <div className="fn-panel">
        <div className="fn-panel-body">
          {loading ? (
            <div className="flex justify-content-center py-5">
              <KProgressSpinner />
            </div>
          ) : (
            <KDataTable
              className="fn-data-table"
              value={suppliers}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              emptyMessage="No suppliers found."
              stripedRows
              rowHover
              removableSort
            >
              <KColumn field="companyName" header="Company" sortable />
              <KColumn field="contactPerson" header="Contact" sortable />
              <KColumn field="email" header="Email" sortable />
              <KColumn field="phone" header="Phone" />
              <KColumn field="services" header="Services" />
              <KColumn
                field="status"
                header="Account"
                body={(row) => <StatusTag status={row.status} />}
              />
            </KDataTable>
          )}
        </div>
      </div>
    </div>
  );
}
