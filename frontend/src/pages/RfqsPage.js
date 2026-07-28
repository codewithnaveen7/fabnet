import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KButton, KColumn, KDataTable, KProgressSpinner, KTag } from "kdesigns/KDesign";
import { useMutationPost, useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import { unwrapApiData } from "../utils/apiResponse";
import { RFQ_STATUS_LABELS } from "../constants/rfqOptions";
import "../styles/dashboard.css";

function statusSeverity(status) {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "SENT":
      return "info";
    case "QUOTES_RECEIVED":
      return "warning";
    case "AWARDED":
      return "success";
    case "CLOSED":
      return "danger";
    default:
      return "secondary";
  }
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

function ActionButtons({ row, onView, onEdit, onDelete, deleting }) {
  return (
    <div className="fn-table-actions">
      <KButton
        type="button"
        icon="pi pi-eye"
        severity="secondary"
        outlined
        size="small"
        tooltip="View"
        onClick={() => onView(row.id)}
      />
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

export default function RfqsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { postData: deleteRfq } = useMutationPost({
    mutationKey: ["fabnet-rfq-delete"],
  });

  const { data, isLoading } = useQueryGet({
    eventMessage: {},
    eventType: "FABNET_LIST_RFQS",
    url: "/rfqs",
    enabled: true,
    queryKey: ["rfqs", "list"],
    select: (result) => unwrapApiData(result) ?? [],
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((rfq, index) => ({
      srNo: index + 1,
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      clientProjectName: rfq.clientProjectName,
      quoteDueDate: formatDate(rfq.quoteDueDate),
      status: rfq.status,
      requestedBy: rfq.requestedBy?.name || "—",
      inviteCount: rfq._count?.invites ?? 0,
    }));
  }, [data]);

  const handleView = (id) => navigate(`/dashboard/rfqs/${id}`);
  const handleEdit = (id) => navigate(`/dashboard/rfqs/${id}/edit`);

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      `Delete RFQ "${row.rfqNumber}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      await deleteRfq({ id: row.id }, "FABNET_DELETE_RFQ", "/rfqs/delete");
      await queryClient.invalidateQueries({ queryKey: ["queryGet", "rfqs"] });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-content-center py-5">
        <KProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="fn-page-header">
        <div>
          <h1 className="fn-page-title">RFQs</h1>
          <p className="fn-page-subtitle mb-0">Create and track requests for quotation.</p>
        </div>
        <KButton
          type="button"
          label="Create RFQ"
          icon="pi pi-plus"
          onClick={() => navigate("/dashboard/rfqs/add")}
        />
      </div>

      <div className="fn-panel">
        <div className="fn-panel-body">
          <KDataTable
            value={rows}
            paginator
            rows={10}
            emptyMessage="No RFQs yet. Create your first request for quotation."
            className="fn-data-table"
          >
            <KColumn field="srNo" header="#" style={{ width: "60px" }} />
            <KColumn field="rfqNumber" header="RFQ number" sortable />
            <KColumn field="title" header="Title" sortable />
            <KColumn field="clientProjectName" header="Client / project" />
            <KColumn field="quoteDueDate" header="Quote due" />
            <KColumn field="requestedBy" header="Requested by" />
            <KColumn
              field="status"
              header="Status"
              body={(row) => (
                <KTag
                  value={RFQ_STATUS_LABELS[row.status] || row.status}
                  severity={statusSeverity(row.status)}
                />
              )}
            />
            <KColumn field="inviteCount" header="Invites" style={{ width: "90px" }} />
            <KColumn
              header="Actions"
              style={{ width: "140px" }}
              body={(row) => (
                <ActionButtons
                  row={row}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deleting={deletingId}
                />
              )}
            />
          </KDataTable>
        </div>
      </div>
    </div>
  );
}
