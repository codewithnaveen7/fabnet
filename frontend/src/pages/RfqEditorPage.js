import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  KButton,
  KCalendar,
  KDropdown,
  KInputNumber,
  KInputSwitch,
  KInputText,
  KMultiSelect,
  KProgressSpinner,
} from "kdesigns/KDesign";
import { useMutationPost, useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import FormSection from "../components/FormSection";
import DocumentListField from "../components/DocumentListField";
import { addRfqSchema } from "../validation/schemas";
import { unwrapApiData } from "../utils/apiResponse";
import { postRfqForm } from "../utils/postRfqForm";
import { selectUser } from "../store/authSlice";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  INCOTERMS_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  REQUIRED_CERT_OPTIONS,
  RFQ_STATUS_LABELS,
  SPECIAL_PROCESS_OPTIONS,
  UNIT_OPTIONS,
} from "../constants/rfqOptions";
import "../styles/dashboard.css";

const defaultValues = {
  title: "",
  clientProjectName: "",
  quoteDueDate: null,
  requiredDeliveryDate: null,
  partName: "",
  partNumber: "",
  revisionLevel: "",
  quantity: null,
  unitOfMeasure: "EA",
  processServiceIds: [],
  materialSpecification: "",
  specialProcesses: [],
  toleranceNotes: "",
  requiredCertifications: [],
  itarExportControl: false,
  countryOfOriginRestriction: "",
  incoterms: "EXW",
  targetBudgetaryPrice: "",
  paymentTerms: "",
  currency: "USD",
  quotesRequired: "",
};

function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function asNumberOrEmpty(value) {
  if (value === "" || value == null) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
}

function rfqToFormValues(rfq) {
  return {
    title: rfq.title || "",
    clientProjectName: rfq.clientProjectName || "",
    quoteDueDate: toDateOrNull(rfq.quoteDueDate),
    requiredDeliveryDate: toDateOrNull(rfq.requiredDeliveryDate),
    partName: rfq.partName || "",
    partNumber: rfq.partNumber || "",
    revisionLevel: rfq.revisionLevel || "",
    quantity: rfq.quantity == null ? null : Number(rfq.quantity),
    unitOfMeasure: rfq.unitOfMeasure || "EA",
    processServiceIds: (rfq.processServices || []).map((row) => row.serviceId),
    materialSpecification: rfq.materialSpecification || "",
    specialProcesses: Array.isArray(rfq.specialProcesses) ? rfq.specialProcesses : [],
    toleranceNotes: rfq.toleranceNotes || "",
    requiredCertifications: Array.isArray(rfq.requiredCertifications)
      ? rfq.requiredCertifications
      : [],
    itarExportControl: Boolean(rfq.itarExportControl),
    countryOfOriginRestriction: rfq.countryOfOriginRestriction || "",
    incoterms: rfq.incoterms || "EXW",
    targetBudgetaryPrice: asNumberOrEmpty(rfq.targetBudgetaryPrice),
    paymentTerms: rfq.paymentTerms || "",
    currency: rfq.currency || "USD",
    quotesRequired: asNumberOrEmpty(rfq.quotesRequired),
  };
}

function invitesFromRfq(rfq) {
  return (rfq.invites || [])
    .filter((invite) => invite.included !== false)
    .map((invite) => invite.supplierId)
    .filter(Boolean);
}

function supplierOptionLabel(s) {
  return s.companyName || "Supplier";
}

function supplierOptionMeta(s) {
  const bits = [];
  if (s.contactPerson) bits.push(s.contactPerson);
  if (s.email) bits.push(s.email);
  if (s.itarRegistered) bits.push("ITAR");
  return bits.join(" · ");
}

export default function RfqEditorPage({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawings, setDrawings] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [removeDocumentIds, setRemoveDocumentIds] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [suggestedIdSet, setSuggestedIdSet] = useState(() => new Set());
  const suggestedIdsRef = useRef(new Set());
  const [meta, setMeta] = useState(null);
  const [ready, setReady] = useState(!isEdit);

  const { postData: suggestSuppliers } = useMutationPost({
    mutationKey: ["fabnet-rfq-suggest"],
  });
  const { postData: fetchFileUrl } = useMutationPost({
    mutationKey: ["fabnet-rfq-file-url"],
  });

  const { data: servicesData } = useQueryGet({
    eventMessage: { status: "ACTIVE" },
    eventType: "FABNET_LIST_SERVICES",
    url: "/services",
    enabled: true,
    queryKey: ["services", "list", "active"],
    select: (result) => unwrapApiData(result) ?? [],
  });

  const { data: rfqData, isLoading: rfqLoading } = useQueryGet({
    eventMessage: { id },
    eventType: "FABNET_GET_RFQ",
    url: "/rfqs/get",
    enabled: isEdit && Boolean(id),
    queryKey: ["rfqs", "detail", id],
    select: (result) => unwrapApiData(result),
  });

  const serviceOptions = useMemo(
    () =>
      (Array.isArray(servicesData) ? servicesData : [])
        .filter((s) => !s.status || s.status === "ACTIVE")
        .map((s) => ({
          label: s.name,
          value: s.id,
        })),
    [servicesData]
  );

  const { control, handleSubmit, watch, reset } = useForm({
    resolver: zodResolver(addRfqSchema),
    defaultValues,
    mode: "onTouched",
  });

  const processServiceIds = watch("processServiceIds");
  const itarExportControl = watch("itarExportControl");
  const processServiceKey = useMemo(
    () =>
      (Array.isArray(processServiceIds) ? [...processServiceIds].filter(Boolean).sort() : []).join(
        "|"
      ),
    [processServiceIds]
  );

  useEffect(() => {
    if (!isEdit || !rfqData) return;
    reset(rfqToFormValues(rfqData));
    const savedIds = invitesFromRfq(rfqData);
    setSelectedSupplierIds(savedIds);
    suggestedIdsRef.current = new Set();
    setSuggestedIdSet(new Set());
    setExistingDocs(rfqData.documents || []);
    setRemoveDocumentIds([]);
    setDrawings([]);
    setMeta({
      rfqNumber: rfqData.rfqNumber,
      dateCreated: rfqData.dateCreated,
      status: rfqData.status,
      requestedBy: rfqData.requestedBy,
    });
    setReady(true);
    // reset identity can change; hydrate only when RFQ payload arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, rfqData]);

  useEffect(() => {
    if (!ready) return;
    const serviceIds = processServiceKey ? processServiceKey.split("|") : [];

    let cancelled = false;
    (async () => {
      try {
        const result = await suggestSuppliers(
          {
            processServiceIds: serviceIds,
            itarExportControl: Boolean(itarExportControl),
          },
          "FABNET_RFQ_SUGGEST_SUPPLIERS",
          "/rfqs/suggest-suppliers"
        );
        if (cancelled) return;
        const payload = unwrapApiData(result) ?? {};
        const list = Array.isArray(payload.options)
          ? payload.options
          : Array.isArray(payload)
            ? payload
            : [];
        const nextSuggested = new Set(
          Array.isArray(payload.suggestedIds)
            ? payload.suggestedIds.filter(Boolean)
            : list.filter((s) => s.matched !== false).map((s) => s.supplierId)
        );

        setSupplierOptions(
          [...list]
            .sort((a, b) => {
              const aSuggested = nextSuggested.has(a.supplierId) ? 0 : 1;
              const bSuggested = nextSuggested.has(b.supplierId) ? 0 : 1;
              if (aSuggested !== bSuggested) return aSuggested - bSuggested;
              return String(a.companyName || "").localeCompare(String(b.companyName || ""));
            })
            .map((s) => ({
              label: supplierOptionLabel(s),
              meta: supplierOptionMeta(s),
              value: s.supplierId,
              suggested: nextSuggested.has(s.supplierId),
            }))
        );

        setSelectedSupplierIds((prev) => {
          const prevSuggested = suggestedIdsRef.current;
          const manual = prev.filter((sid) => !prevSuggested.has(sid));
          const merged = new Set([...nextSuggested, ...manual]);
          return [...merged];
        });
        suggestedIdsRef.current = nextSuggested;
        setSuggestedIdSet(nextSuggested);
      } catch {
        if (!cancelled && !isEdit) {
          setSupplierOptions([]);
          setSelectedSupplierIds([]);
          suggestedIdsRef.current = new Set();
          setSuggestedIdSet(new Set());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, processServiceKey, itarExportControl, isEdit]);

  const handleDownload = async (doc) => {
    if (!id || !doc?.id) return;
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

  const onSubmit = async (values) => {
    setSubmitError("");
    setLoading(true);
    try {
      const payload = {
        ...values,
        quoteDueDate: toIsoDate(values.quoteDueDate),
        requiredDeliveryDate: toIsoDate(values.requiredDeliveryDate),
        revisionLevel: values.revisionLevel || null,
        materialSpecification: values.materialSpecification || null,
        toleranceNotes: values.toleranceNotes || null,
        countryOfOriginRestriction: values.countryOfOriginRestriction || null,
        paymentTerms: values.paymentTerms || null,
        targetBudgetaryPrice:
          values.targetBudgetaryPrice === "" || values.targetBudgetaryPrice == null
            ? null
            : values.targetBudgetaryPrice,
        quotesRequired:
          values.quotesRequired === "" || values.quotesRequired == null
            ? null
            : values.quotesRequired,
        invites: selectedSupplierIds.map((supplierId) => ({
          supplierId,
          included: true,
        })),
        ...(isEdit
          ? {
              id,
              removeDocumentIds,
            }
          : {}),
      };
      const result = await postRfqForm(
        isEdit ? "/rfqs/update" : "/rfqs/create",
        payload,
        { drawings },
        isEdit ? "FABNET_UPDATE_RFQ" : "FABNET_CREATE_RFQ"
      );
      if (unwrapApiData(result)) {
        await queryClient.invalidateQueries({ queryKey: ["queryGet", "rfqs"] });
        if (isEdit) {
          await queryClient.invalidateQueries({ queryKey: ["queryGet", "rfqs", "detail", id] });
        }
        navigate("/dashboard/rfqs");
      }
    } catch {
      setSubmitError(
        isEdit
          ? "Unable to update RFQ. Please check the form and try again."
          : "Unable to create RFQ. Please check the form and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = selectedSupplierIds.length;
  const suggestedSelectedCount = selectedSupplierIds.filter((sid) =>
    suggestedIdSet.has(sid)
  ).length;

  if (isEdit && (rfqLoading || !ready)) {
    return (
      <div className="flex justify-content-center py-5">
        <KProgressSpinner />
      </div>
    );
  }

  if (isEdit && !rfqData) {
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

  const rfqNumberLabel = isEdit ? meta?.rfqNumber || "—" : "Auto-generated on save";
  const requestedByLabel = isEdit
    ? meta?.requestedBy?.name || meta?.requestedBy?.email || "—"
    : user?.name || user?.email || "—";
  const dateCreatedLabel = isEdit
    ? meta?.dateCreated
      ? new Date(meta.dateCreated).toISOString().slice(0, 10)
      : "—"
    : new Date().toISOString().slice(0, 10);
  const statusLabel = isEdit
    ? RFQ_STATUS_LABELS[meta?.status] || meta?.status || "—"
    : "Draft";

  return (
    <div className="fn-saas-form-page">
      <div className="fn-page-header">
        <div>
          <h1 className="fn-page-title">{isEdit ? "Edit RFQ" : "Create RFQ"}</h1>
          <p className="fn-page-subtitle mb-0">
            {isEdit
              ? "Update this request for quotation."
              : "Draft a request for quotation. RFQ number is assigned on save."}
          </p>
        </div>
        <KButton
          type="button"
          label="Back to list"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate("/dashboard/rfqs")}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-fluid fn-saas-form">
        <FormSection
          icon="pi pi-file"
          title="RFQ header"
          description="Identity, client, and key dates for this request."
        >
          <div className="fn-form-grid">
            <div className="field mb-3">
              <label className="fn-field-label">RFQ number</label>
              <KInputText value={rfqNumberLabel} disabled />
            </div>
            <div className="field mb-3">
              <label className="fn-field-label">Requested by</label>
              <KInputText value={requestedByLabel} disabled />
            </div>
            <ValidatedField
              name="title"
              control={control}
              label="RFQ title"
              htmlFor="title"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KInputText id="title" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="clientProjectName"
              control={control}
              label="Client / project name"
              htmlFor="clientProjectName"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KInputText
                  id="clientProjectName"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <div className="field mb-3">
              <label className="fn-field-label">Date created</label>
              <KInputText value={dateCreatedLabel} disabled />
            </div>
            <ValidatedField
              name="quoteDueDate"
              control={control}
              label="Quote due date"
              render={(field, fieldState) => (
                <KCalendar
                  inputId="quoteDueDate"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="requiredDeliveryDate"
              control={control}
              label="Required delivery date"
              render={(field, fieldState) => (
                <KCalendar
                  inputId="requiredDeliveryDate"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className={fieldClassName(fieldState)}
                />
              )}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-box"
          title="Part details"
          description="Part identity and drawing / specification files."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="partName"
              control={control}
              label="Part / assembly name"
              htmlFor="partName"
              render={(field, fieldState) => (
                <KInputText id="partName" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="partNumber"
              control={control}
              label="Part number / drawing number"
              htmlFor="partNumber"
              render={(field, fieldState) => (
                <KInputText id="partNumber" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="revisionLevel"
              control={control}
              label="Revision level"
              htmlFor="revisionLevel"
              render={(field, fieldState) => (
                <KInputText id="revisionLevel" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <div className="fn-form-full">
              <DocumentListField
                id="drawings"
                label="Drawing / spec files"
                hint="PDF or images, up to 10 files"
                maxFiles={10}
                existing={existingDocs}
                pending={drawings}
                onPendingChange={setDrawings}
                onRemoveExisting={(doc) => {
                  setExistingDocs((prev) => prev.filter((d) => d.id !== doc.id));
                  setRemoveDocumentIds((prev) =>
                    prev.includes(doc.id) ? prev : [...prev, doc.id]
                  );
                }}
                onDownloadExisting={handleDownload}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-cog"
          title="Technical requirements"
          description="Process category uses the Services catalog and matches suppliers offering those services."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="processServiceIds"
              control={control}
              label="Process category"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KMultiSelect
                  inputId="rfq-processServiceIds"
                  value={field.value}
                  options={serviceOptions}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Select services"
                  display="chip"
                  filter
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="materialSpecification"
              control={control}
              label="Material specification"
              htmlFor="materialSpecification"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KInputText
                  id="materialSpecification"
                  {...field}
                  placeholder="e.g. Ti-6Al-4V, Al 7075-T6"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="quantity"
              control={control}
              label="Quantity"
              render={(field, fieldState) => (
                <KInputNumber
                  inputId="rfq-quantity"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  min={0}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="unitOfMeasure"
              control={control}
              label="Unit of measure"
              render={(field, fieldState) => (
                <KDropdown
                  inputId="rfq-unitOfMeasure"
                  value={field.value}
                  options={UNIT_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="specialProcesses"
              control={control}
              label="Special process requirements"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KMultiSelect
                  inputId="rfq-specialProcesses"
                  value={field.value}
                  options={SPECIAL_PROCESS_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="NDT, heat treat, finish…"
                  display="chip"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="toleranceNotes"
              control={control}
              label="Tolerance / quality notes"
              htmlFor="toleranceNotes"
              className="fn-form-full"
              render={(field, fieldState) => (
                <textarea
                  id="toleranceNotes"
                  rows={3}
                  {...field}
                  className={`fn-textarea ${fieldClassName(fieldState)}`.trim()}
                />
              )}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-shield"
          title="Compliance"
          description="Certifications and export-control requirements."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="requiredCertifications"
              control={control}
              label="Required certifications"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KMultiSelect
                  inputId="rfq-requiredCertifications"
                  value={field.value}
                  options={REQUIRED_CERT_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="AS9100, NADCAP, ISO…"
                  display="chip"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <div className="fn-form-full fn-toggle-row">
              <div>
                <div className="fn-toggle-label">ITAR / export control</div>
                <div className="fn-toggle-hint">
                  When on, only ITAR-registered suppliers are suggested
                </div>
              </div>
              <ValidatedField
                name="itarExportControl"
                control={control}
                label=""
                htmlFor="itarExportControl"
                className="fn-toggle-control"
                render={(field) => (
                  <KInputSwitch
                    inputId="itarExportControl"
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.value)}
                  />
                )}
              />
            </div>
            <ValidatedField
              name="countryOfOriginRestriction"
              control={control}
              label="Country of origin restriction"
              render={(field, fieldState) => (
                <KDropdown
                  inputId="rfq-countryOfOriginRestriction"
                  value={field.value || null}
                  options={COUNTRY_OPTIONS}
                  onChange={(e) => field.onChange(e.value || "")}
                  showClear
                  placeholder="Optional"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-wallet"
          title="Commercial"
          description="Incoterms, pricing targets, and payment preferences."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="incoterms"
              control={control}
              label="Incoterms"
              render={(field, fieldState) => (
                <KDropdown
                  inputId="rfq-incoterms"
                  value={field.value}
                  options={INCOTERMS_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="currency"
              control={control}
              label="Currency"
              render={(field, fieldState) => (
                <KDropdown
                  inputId="rfq-currency"
                  value={field.value}
                  options={CURRENCY_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="targetBudgetaryPrice"
              control={control}
              label="Target / budgetary price (internal)"
              render={(field, fieldState) => (
                <KInputNumber
                  inputId="rfq-targetBudgetaryPrice"
                  value={field.value === "" ? null : field.value}
                  onValueChange={(e) => field.onChange(e.value ?? "")}
                  mode="currency"
                  currency={watch("currency") || "USD"}
                  locale="en-US"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="paymentTerms"
              control={control}
              label="Payment terms requested"
              render={(field, fieldState) => (
                <KDropdown
                  inputId="rfq-paymentTerms"
                  value={field.value || null}
                  options={PAYMENT_TERMS_OPTIONS}
                  onChange={(e) => field.onChange(e.value || "")}
                  showClear
                  placeholder="Optional"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="quotesRequired"
              control={control}
              label="Number of quotes required"
              render={(field, fieldState) => (
                <KInputNumber
                  inputId="rfq-quotesRequired"
                  value={field.value === "" ? null : field.value}
                  onValueChange={(e) => field.onChange(e.value ?? "")}
                  min={1}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <div className="field mb-3">
              <label className="fn-field-label">RFQ status</label>
              <KInputText value={statusLabel} disabled />
            </div>
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-users"
          title="Suppliers invited"
          description="Auto-suggested suppliers stay selected. Add or remove others from the list."
        >
          <div className="field mb-0 fn-invite-field">
            <label htmlFor="rfq-invited-suppliers" className="fn-field-label">
              Invite suppliers
            </label>
            <KMultiSelect
              inputId="rfq-invited-suppliers"
              value={selectedSupplierIds}
              options={supplierOptions}
              onChange={(e) => setSelectedSupplierIds(e.value || [])}
              optionLabel="label"
              placeholder={
                supplierOptions.length
                  ? "Select suppliers to invite"
                  : "Loading suppliers…"
              }
              display="chip"
              filter
              filterPlaceholder="Search suppliers"
              showClear
              className="fn-invite-multiselect"
              panelClassName="fn-invite-multiselect-panel"
              itemTemplate={(option) => (
                <div className="fn-invite-option">
                  <div className="fn-invite-option-text">
                    <span className="fn-invite-option-name">{option.label}</span>
                    {option.meta ? (
                      <span className="fn-invite-option-meta">{option.meta}</span>
                    ) : null}
                  </div>
                  {option.suggested ? (
                    <span className="fn-invite-option-badge">Suggested</span>
                  ) : null}
                </div>
              )}
            />
            <small className="fn-field-hint">
              {selectedCount
                ? `${selectedCount} selected${
                    suggestedSelectedCount
                      ? ` (${suggestedSelectedCount} auto-suggested)`
                      : ""
                  }`
                : "Select process category (services) to auto-suggest matches, or pick suppliers manually."}
            </small>
          </div>
        </FormSection>

        {submitError ? <small className="p-error fn-form-error">{submitError}</small> : null}

        <div className="fn-form-sticky-actions">
          <KButton
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            onClick={() => navigate("/dashboard/rfqs")}
          />
          <KButton
            type="submit"
            label={isEdit ? "Save changes" : "Create RFQ"}
            icon="pi pi-check"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
}
