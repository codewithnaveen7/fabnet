import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  KButton,
  KProgressSpinner,
  KTag,
} from "kdesigns/KDesign";
import { useMutationPost, useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import FormSection from "../components/FormSection";
import { unwrapApiData } from "../utils/apiResponse";
import { RFQ_STATUS_LABELS } from "../constants/rfqOptions";
import { selectRole } from "../store/authSlice";
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

function formatMoney(value, currency = "USD") {
  if (value === "" || value == null) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(n);
  } catch {
    return String(value);
  }
}

function Detail({ label, children }) {
  return (
    <div className="field mb-3">
      <div className="fn-field-label">{label}</div>
      <div className="fn-detail-value">{children ?? "—"}</div>
    </div>
  );
}

export default function ViewRfqPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSelector(selectRole);
  const isAdmin = role === "ADMIN";
  const [deleting, setDeleting] = useState(false);

  const { postData: deleteRfq } = useMutationPost({
    mutationKey: ["fabnet-rfq-delete"],
  });
  const { postData: fetchFileUrl } = useMutationPost({
    mutationKey: ["fabnet-rfq-file-url"],
  });

  const { data: rfq, isLoading } = useQueryGet({
    eventMessage: { id },
    eventType: "FABNET_GET_RFQ",
    url: "/rfqs/get",
    enabled: Boolean(id),
    queryKey: ["rfqs", "detail", id],
    select: (result) => unwrapApiData(result),
  });

  const processNames = useMemo(
    () =>
      (rfq?.processServices || [])
        .map((row) => row.service?.name)
        .filter(Boolean)
        .join(", ") || "—",
    [rfq]
  );

  const specialProcesses = useMemo(() => {
    const list = Array.isArray(rfq?.specialProcesses) ? rfq.specialProcesses : [];
    return list.length ? list.join(", ") : "—";
  }, [rfq]);

  const certifications = useMemo(() => {
    const list = Array.isArray(rfq?.requiredCertifications) ? rfq.requiredCertifications : [];
    return list.length ? list.join(", ") : "—";
  }, [rfq]);

  const handleDownload = async (doc) => {
    try {
      const result = await fetchFileUrl(
        { rfqId: id, id: doc.id },
        "FABNET_RFQ_FILE_URL",
        "/rfqs/file-url"
      );
      const url = unwrapApiData(result)?.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // toast handled by hook
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete RFQ "${rfq?.rfqNumber || id}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteRfq({ id }, "FABNET_DELETE_RFQ", "/rfqs/delete");
      await queryClient.invalidateQueries({ queryKey: ["queryGet", "rfqs"] });
      navigate("/dashboard/rfqs");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-content-center py-5">
        <KProgressSpinner />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="fn-panel">
        <div className="fn-panel-body">
          <p className="mb-3">RFQ not found.</p>
          <KButton
            type="button"
            label="Back to list"
            icon="pi pi-arrow-left"
            onClick={() => navigate("/dashboard/rfqs")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fn-saas-form-page">
      <div className="fn-page-header">
        <div>
          <h1 className="fn-page-title">{rfq.rfqNumber}</h1>
          <p className="fn-page-subtitle mb-0">{rfq.title}</p>
        </div>
        <div className="fn-page-actions">
          <KButton
            type="button"
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => navigate("/dashboard/rfqs")}
          />
          {isAdmin ? (
            <>
              <KButton
                type="button"
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => navigate(`/dashboard/rfqs/${id}/edit`)}
              />
              <KButton
                type="button"
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                outlined
                loading={deleting}
                onClick={handleDelete}
              />
            </>
          ) : null}
        </div>
      </div>

      <div className="fn-saas-form">
        <FormSection icon="pi pi-file" title="RFQ header" description="Identity and key dates.">
          <div className="fn-form-grid">
            <Detail label="RFQ number">{rfq.rfqNumber}</Detail>
            <Detail label="Status">
              <KTag
                value={RFQ_STATUS_LABELS[rfq.status] || rfq.status}
                severity={statusSeverity(rfq.status)}
              />
            </Detail>
            <Detail label="Title">{rfq.title}</Detail>
            <Detail label="Client / project">{rfq.clientProjectName}</Detail>
            <Detail label="Requested by">
              {rfq.requestedBy?.name || rfq.requestedBy?.email || "—"}
            </Detail>
            <Detail label="Date created">{formatDate(rfq.dateCreated)}</Detail>
            <Detail label="Quote due date">{formatDate(rfq.quoteDueDate)}</Detail>
            <Detail label="Required delivery date">{formatDate(rfq.requiredDeliveryDate)}</Detail>
          </div>
        </FormSection>

        <FormSection icon="pi pi-box" title="Part details" description="Part identity and files.">
          <div className="fn-form-grid">
            <Detail label="Part / assembly name">{rfq.partName}</Detail>
            <Detail label="Part number">{rfq.partNumber}</Detail>
            <Detail label="Revision level">{rfq.revisionLevel || "—"}</Detail>
            <div className="fn-form-full">
              <div className="fn-field-label">Drawing / spec files</div>
              {rfq.documents?.length ? (
                <ul className="fn-invite-list">
                  {rfq.documents.map((doc) => (
                    <li key={doc.id} className="fn-invite-row">
                      <div className="fn-invite-meta">
                        <span>{doc.fileName}</span>
                        <KButton
                          type="button"
                          label="Download"
                          size="small"
                          text
                          onClick={() => handleDownload(doc)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="fn-doc-empty mb-0">No files uploaded.</p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-cog"
          title="Technical requirements"
          description="Process, material, and quality notes."
        >
          <div className="fn-form-grid">
            <Detail label="Process category">{processNames}</Detail>
            <Detail label="Material specification">{rfq.materialSpecification || "—"}</Detail>
            <Detail label="Quantity">
              {rfq.quantity != null ? `${rfq.quantity} ${rfq.unitOfMeasure || ""}`.trim() : "—"}
            </Detail>
            <Detail label="Special processes">{specialProcesses}</Detail>
            <Detail label="Tolerance / quality notes">{rfq.toleranceNotes || "—"}</Detail>
          </div>
        </FormSection>

        <FormSection icon="pi pi-shield" title="Compliance" description="Certifications and export control.">
          <div className="fn-form-grid">
            <Detail label="Required certifications">{certifications}</Detail>
            <Detail label="ITAR / export control">{rfq.itarExportControl ? "Yes" : "No"}</Detail>
            <Detail label="Country of origin restriction">
              {rfq.countryOfOriginRestriction || "—"}
            </Detail>
          </div>
        </FormSection>

        <FormSection icon="pi pi-wallet" title="Commercial" description="Pricing and terms.">
          <div className="fn-form-grid">
            <Detail label="Incoterms">{rfq.incoterms}</Detail>
            <Detail label="Currency">{rfq.currency}</Detail>
            {isAdmin ? (
              <Detail label="Target / budgetary price">
                {formatMoney(rfq.targetBudgetaryPrice, rfq.currency)}
              </Detail>
            ) : null}
            <Detail label="Payment terms">{rfq.paymentTerms || "—"}</Detail>
            <Detail label="Quotes required">{rfq.quotesRequired ?? "—"}</Detail>
          </div>
        </FormSection>

        {isAdmin ? (
          <FormSection
            icon="pi pi-users"
            title="Suppliers invited"
            description="Suppliers currently on this RFQ."
          >
            {rfq.invites?.length ? (
              <ul className="fn-invite-list">
                {rfq.invites.map((invite) => (
                  <li key={invite.id || invite.supplierId} className="fn-invite-row">
                    <div className="fn-invite-meta">
                      <div>
                        <strong>{invite.supplier?.companyName || "—"}</strong>
                        <span className="fn-invite-sub">
                          {invite.supplier?.contactPerson || ""}
                          {invite.supplier?.user?.email
                            ? ` · ${invite.supplier.user.email}`
                            : ""}
                          {invite.included === false ? " · Excluded" : ""}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fn-doc-empty mb-0">No suppliers invited.</p>
            )}
          </FormSection>
        ) : null}
      </div>
    </div>
  );
}
