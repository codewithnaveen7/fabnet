import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KButton, KColumn, KDataTable, KProgressSpinner, KTag } from "kdesigns/KDesign";
import { useMutationPost, useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
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

function ActionButtons({ row, onEdit, onDelete, deleting }) {
  return (
    <div className="fn-table-actions">
      <KButton
        type="button"
        icon="pi pi-pencil"
        severity="secondary"
        outlined
        size="small"
        tooltip="Edit"
        onClick={() => onEdit(row.id)}
      />
      <KButton
        type="button"
        icon="pi pi-trash"
        severity="danger"
        outlined
        size="small"
        tooltip="Delete"
        loading={deleting === row.id}
        onClick={() => onDelete(row)}
      />
    </div>
  );
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { postData: deleteSupplier } = useMutationPost({
    mutationKey: ["fabnet-supplier-delete"],
  });

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
    return list.map((user, index) => ({
      srNo: index + 1,
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

  const handleEdit = (id) => {
    navigate(`/dashboard/suppliers/${id}/edit`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      `Delete supplier "${row.companyName}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      await deleteSupplier({ id: row.id }, "FABNET_DELETE_SUPPLIER", "/suppliers/delete");
      await queryClient.invalidateQueries({
        queryKey: ["queryGet", "suppliers", "list", "/suppliers"],
      });
    } finally {
      setDeletingId(null);
    }
  };

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
        <div className="fn-page-actions">
          <KButton
            label="Bulk upload"
            icon="pi pi-upload"
            severity="secondary"
            outlined
            onClick={() => navigate("/dashboard/suppliers/bulk-upload")}
          />
          <KButton
            label="Add supplier"
            icon="pi pi-plus"
            onClick={() => navigate("/dashboard/suppliers/add")}
          />
        </div>
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
              <KColumn field="srNo" header="Sr No" style={{ width: "80px" }} />
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
              <KColumn
                header="Actions"
                body={(row) => (
                  <ActionButtons
                    row={row}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleting={deletingId}
                  />
                )}
                style={{ width: "120px" }}
              />
            </KDataTable>
          )}
        </div>
      </div>
    </div>
  );
}
