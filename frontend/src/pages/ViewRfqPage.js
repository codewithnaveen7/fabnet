import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  KButton,
  KInputNumber,
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

function quoteKey(supplierId, serviceId) {
  return `${supplierId}::${serviceId}`;
}

export default function ViewRfqPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSelector(selectRole);
  const isAdmin = role === "ADMIN";
  const [deleting, setDeleting] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [priceDrafts, setPriceDrafts] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [awardingKey, setAwardingKey] = useState(null);

  const { postData: deleteRfq } = useMutationPost({
    mutationKey: ["fabnet-rfq-delete"],
  });
  const { postData: fetchFileUrl } = useMutationPost({
    mutationKey: ["fabnet-rfq-file-url"],
  });
  const { postData: upsertQuote } = useMutationPost({
    mutationKey: ["fabnet-rfq-upsert-quote"],
  });
  const { postData: setAward } = useMutationPost({
    mutationKey: ["fabnet-rfq-set-award"],
  });

  const { data: rfq, isLoading } = useQueryGet({
    eventMessage: { id },
    eventType: "FABNET_GET_RFQ",
    url: "/rfqs/get",
    enabled: Boolean(id),
    queryKey: ["rfqs", "detail", id],
    select: (result) => unwrapApiData(result),
  });

  const processServices = useMemo(
    () =>
      (rfq?.processServices || [])
        .map((row) => row.service)
        .filter((s) => s?.id),
    [rfq]
  );

  useEffect(() => {
    if (!processServices.length) {
      setActiveServiceId(null);
      return;
    }
    setActiveServiceId((prev) =>
      prev && processServices.some((s) => s.id === prev)
        ? prev
        : processServices[0].id
    );
  }, [processServices]);

  useEffect(() => {
    if (!rfq) return;
    const next = {};
    for (const quote of rfq.quotes || []) {
      next[quoteKey(quote.supplierId, quote.serviceId)] = Number(quote.price);
    }
    setPriceDrafts(next);
  }, [rfq]);

  const processNames = useMemo(
    () => processServices.map((s) => s.name).filter(Boolean).join(", ") || "—",
    [processServices]
  );

  const specialProcesses = useMemo(() => {
    const list = Array.isArray(rfq?.specialProcesses) ? rfq.specialProcesses : [];
    return list.length ? list.join(", ") : "—";
  }, [rfq]);

  const certifications = useMemo(() => {
    const list = Array.isArray(rfq?.requiredCertifications)
      ? rfq.requiredCertifications
      : [];
    return list.length ? list.join(", ") : "—";
  }, [rfq]);

  const awardByService = useMemo(() => {
    const map = {};
    for (const award of rfq?.awards || []) {
      map[award.serviceId] = award;
    }
    return map;
  }, [rfq]);

  const adminRowsForActiveService = useMemo(() => {
    if (!isAdmin || !rfq || !activeServiceId) return [];
    const quotesBySupplier = {};
    for (const quote of rfq.quotes || []) {
      if (quote.serviceId === activeServiceId) {
        quotesBySupplier[quote.supplierId] = quote;
      }
    }
    return (rfq.invites || [])
      .filter((invite) => invite.included !== false)
      .filter((invite) =>
        (invite.supplier?.services || []).some(
          (row) => row.serviceId === activeServiceId || row.service?.id === activeServiceId
        )
      )
      .map((invite) => ({
        supplierId: invite.supplierId,
        companyName: invite.supplier?.companyName || "—",
        contactPerson: invite.supplier?.contactPerson || "",
        email: invite.supplier?.user?.email || "",
        quote: quotesBySupplier[invite.supplierId] || null,
      }));
  }, [isAdmin, rfq, activeServiceId]);

  const supplierQuoteRows = useMemo(() => {
    if (isAdmin || !rfq) return [];
    const quotable = new Set(rfq.quotableServiceIds || []);
    const quoteByService = {};
    for (const quote of rfq.quotes || []) {
      quoteByService[quote.serviceId] = quote;
    }
    return processServices
      .filter((service) => quotable.has(service.id))
      .map((service) => ({
        service,
        quote: quoteByService[service.id] || null,
      }));
  }, [isAdmin, rfq, processServices]);

  const invalidateRfq = async () => {
    await queryClient.invalidateQueries({ queryKey: ["queryGet", "rfqs", "detail", id] });
    await queryClient.invalidateQueries({ queryKey: ["queryGet", "rfqs"] });
  };

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

  const handleSaveQuote = async ({ supplierId, serviceId }) => {
    const key = quoteKey(supplierId, serviceId);
    const price = priceDrafts[key];
    if (price === "" || price == null) return;
    setSavingKey(key);
    try {
      const payload = { rfqId: id, serviceId, price };
      if (isAdmin) payload.supplierId = supplierId;
      await upsertQuote(payload, "FABNET_UPSERT_RFQ_QUOTE", "/rfqs/upsert-quote");
      await invalidateRfq();
    } finally {
      setSavingKey(null);
    }
  };

  const handleAward = async ({ supplierId, serviceId }) => {
    const key = quoteKey(supplierId, serviceId);
    setAwardingKey(key);
    try {
      await setAward(
        { rfqId: id, serviceId, supplierId },
        "FABNET_SET_RFQ_AWARD",
        "/rfqs/set-award"
      );
      await invalidateRfq();
    } finally {
      setAwardingKey(null);
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

  const currency = rfq.currency || "USD";
  const activeAward = activeServiceId ? awardByService[activeServiceId] : null;

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
                      <div className="fn-invite-option-text">
                        <strong className="fn-invite-option-name">
                          {invite.supplier?.companyName || "—"}
                        </strong>
                        <span className="fn-invite-sub">
                          {[
                            invite.supplier?.contactPerson,
                            invite.supplier?.user?.email,
                            invite.included === false ? "Excluded" : null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
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

        {isAdmin && processServices.length ? (
          <FormSection
            icon="pi pi-dollar"
            title="Quotes by category"
            description="Enter or edit supplier prices, then select one winner per category."
          >
            <div className="fn-quote-panel">
              <div className="fn-quote-tabs" role="tablist">
                {processServices.map((service) => {
                  const awarded = awardByService[service.id];
                  return (
                    <button
                      key={service.id}
                      type="button"
                      role="tab"
                      aria-selected={activeServiceId === service.id}
                      className={`fn-quote-tab${
                        activeServiceId === service.id ? " is-active" : ""
                      }`}
                      onClick={() => setActiveServiceId(service.id)}
                    >
                      <span>{service.name}</span>
                      {awarded ? (
                        <span className="fn-quote-tab-badge">Awarded</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div
                className={`fn-quote-status${activeAward ? " is-awarded" : ""}`}
              >
                {activeAward ? (
                  <>
                    <i className="pi pi-check-circle" aria-hidden />
                    <span>
                      Selected: <strong>{activeAward.supplier?.companyName || "—"}</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <i className="pi pi-info-circle" aria-hidden />
                    <span>No supplier selected for this category yet.</span>
                  </>
                )}
              </div>

              {adminRowsForActiveService.length ? (
                <ul className="fn-quote-list">
                  {adminRowsForActiveService.map((row) => {
                    const key = quoteKey(row.supplierId, activeServiceId);
                    const isWinner = activeAward?.supplierId === row.supplierId;
                    return (
                      <li
                        key={key}
                        className={`fn-quote-row${isWinner ? " is-selected" : ""}`}
                      >
                        <div className="fn-quote-row-meta">
                          <div className="fn-quote-row-title">
                            <span className="fn-quote-row-name">{row.companyName}</span>
                            {isWinner ? (
                              <KTag value="Selected" severity="success" />
                            ) : null}
                          </div>
                          <div className="fn-quote-row-sub">
                            {[row.contactPerson, row.email].filter(Boolean).join(" · ") ||
                              "—"}
                          </div>
                        </div>
                        <div className="fn-quote-row-actions">
                          <div className="fn-quote-price-field">
                            <label className="fn-quote-price-label" htmlFor={`quote-${key}`}>
                              Price ({currency})
                            </label>
                            <KInputNumber
                              inputId={`quote-${key}`}
                              value={priceDrafts[key] ?? null}
                              onValueChange={(e) =>
                                setPriceDrafts((prev) => ({
                                  ...prev,
                                  [key]: e.value,
                                }))
                              }
                              mode="currency"
                              currency={currency}
                              locale="en-US"
                              minFractionDigits={2}
                              min={0}
                              placeholder="0.00"
                            />
                          </div>
                          <KButton
                            type="button"
                            label="Save"
                            size="small"
                            loading={savingKey === key}
                            onClick={() =>
                              handleSaveQuote({
                                supplierId: row.supplierId,
                                serviceId: activeServiceId,
                              })
                            }
                          />
                          <KButton
                            type="button"
                            label={isWinner ? "Selected" : "Select"}
                            size="small"
                            severity={isWinner ? "success" : "secondary"}
                            outlined={!isWinner}
                            disabled={
                              !row.quote &&
                              (priceDrafts[key] == null || priceDrafts[key] === "")
                            }
                            loading={awardingKey === key}
                            onClick={async () => {
                              try {
                                if (!row.quote) {
                                  await handleSaveQuote({
                                    supplierId: row.supplierId,
                                    serviceId: activeServiceId,
                                  });
                                }
                                await handleAward({
                                  supplierId: row.supplierId,
                                  serviceId: activeServiceId,
                                });
                              } catch {
                                // toast handled by hook
                              }
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="fn-doc-empty mb-0">
                  No invited suppliers offer this category.
                </p>
              )}
            </div>
          </FormSection>
        ) : null}

        {!isAdmin ? (
          <FormSection
            icon="pi pi-dollar"
            title="Your quotation"
            description={`Enter your price per category (${currency}). Commercial terms stay as on the RFQ.`}
          >
            {supplierQuoteRows.length ? (
              <ul className="fn-quote-list">
                {supplierQuoteRows.map(({ service, quote }) => {
                  const key = quoteKey(rfq.supplierId, service.id);
                  return (
                    <li key={service.id} className="fn-quote-row">
                      <div className="fn-quote-row-meta">
                        <div className="fn-quote-row-title">
                          <span className="fn-quote-row-name">{service.name}</span>
                        </div>
                        <div className="fn-quote-row-sub">
                          {quote
                            ? `Saved ${formatMoney(quote.price, currency)}`
                            : "Not quoted yet"}
                        </div>
                      </div>
                      <div className="fn-quote-row-actions">
                        <div className="fn-quote-price-field">
                          <label className="fn-quote-price-label" htmlFor={`quote-${key}`}>
                            Price ({currency})
                          </label>
                          <KInputNumber
                            inputId={`quote-${key}`}
                            value={priceDrafts[key] ?? null}
                            onValueChange={(e) =>
                              setPriceDrafts((prev) => ({
                                ...prev,
                                [key]: e.value,
                              }))
                            }
                            mode="currency"
                            currency={currency}
                            locale="en-US"
                            minFractionDigits={2}
                            min={0}
                            placeholder="0.00"
                          />
                        </div>
                        <KButton
                          type="button"
                          label="Save quote"
                          size="small"
                          loading={savingKey === key}
                          onClick={() =>
                            handleSaveQuote({
                              supplierId: rfq.supplierId,
                              serviceId: service.id,
                            })
                          }
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="fn-doc-empty mb-0">
                No matching categories for your services on this RFQ.
              </p>
            )}
          </FormSection>
        ) : null}
      </div>
    </div>
  );
}
