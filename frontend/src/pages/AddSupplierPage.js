import React, { useMemo, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  KButton,
  KCalendar,
  KInputSwitch,
  KInputText,
  KMultiSelect,
  KPassword,
} from "kdesigns/KDesign";
import { useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import FormSection from "../components/FormSection";
import DocumentListField from "../components/DocumentListField";
import { addSupplierSchema } from "../validation/schemas";
import { unwrapApiData } from "../utils/apiResponse";
import { postSupplierForm } from "../utils/postSupplierForm";
import "../styles/dashboard.css";

const defaultCertifications = [
  { type: "AS9100", certified: false, expiryDate: null },
  { type: "ISO9001", certified: false, expiryDate: null },
];

const defaultValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  companyName: "",
  contactPerson: "",
  address: "",
  tradeLicenseNumber: "",
  countryOfRegistration: "",
  websiteUrl: "",
  comments: "",
  services: [],
  itarRegistered: false,
  certifications: defaultCertifications,
};

function CertBlock({ control, type, index, file, onFileChange }) {
  const certifications = useWatch({ control, name: "certifications" });
  const certified = certifications?.[index]?.certified;

  return (
    <div className="fn-cert-card">
      <div className="fn-cert-card-title">{type}</div>
      <Controller
        name={`certifications.${index}.type`}
        control={control}
        render={() => null}
      />
      <div className="fn-toggle-row">
        <div>
          <div className="fn-toggle-label">Certified</div>
          <div className="fn-toggle-hint">Mark if this certification is active</div>
        </div>
        <ValidatedField
          name={`certifications.${index}.certified`}
          control={control}
          label=""
          htmlFor={`cert-${type}`}
          className="fn-toggle-control"
          render={(field) => (
            <KInputSwitch
              inputId={`cert-${type}`}
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.value)}
            />
          )}
        />
      </div>
      {certified ? (
        <>
          <ValidatedField
            name={`certifications.${index}.expiryDate`}
            control={control}
            label="Expiry date"
            htmlFor={`exp-${type}`}
            render={(field, fieldState) => (
              <KCalendar
                id={`exp-${type}`}
                value={field.value ? new Date(field.value) : null}
                onChange={(e) => field.onChange(e.value)}
                dateFormat="yy-mm-dd"
                showIcon
                className={fieldClassName(fieldState)}
              />
            )}
          />
          <div className="field mb-0">
            <label htmlFor={`file-${type}`} className="fn-field-label">
              Certificate file
            </label>
            <input
              id={`file-${type}`}
              type="file"
              accept=".pdf,image/*"
              className="fn-file-input"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            />
            {file ? <small className="fn-file-picked">{file.name}</small> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AddSupplierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({
    cert_AS9100: null,
    cert_ISO9001: null,
    capabilityProfile: [],
    brochures: [],
  });

  const { data: servicesData } = useQueryGet({
    eventMessage: { status: "ACTIVE" },
    eventType: "FABNET_LIST_SERVICES",
    url: "/services",
    enabled: true,
    queryKey: ["services", "active"],
    select: (result) => unwrapApiData(result) ?? [],
  });

  const serviceOptions = useMemo(
    () =>
      (Array.isArray(servicesData) ? servicesData : []).map((s) => ({
        label: s.name,
        value: s.id,
      })),
    [servicesData]
  );

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(addSupplierSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setLoading(true);
    try {
      const payload = {
        ...values,
        certifications: (values.certifications || []).map((c) => ({
          type: c.type,
          certified: Boolean(c.certified),
          expiryDate: c.certified && c.expiryDate ? new Date(c.expiryDate).toISOString() : null,
        })),
      };
      const result = await postSupplierForm(
        "/suppliers/create",
        payload,
        files,
        "FABNET_CREATE_SUPPLIER"
      );
      if (unwrapApiData(result)) {
        await queryClient.invalidateQueries({
          queryKey: ["queryGet", "suppliers", "list", "/suppliers"],
        });
        navigate("/dashboard/suppliers");
      }
    } catch {
      setSubmitError("Unable to create supplier. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fn-saas-form-page">
      <div className="fn-page-header">
        <div>
          <h1 className="fn-page-title">Add supplier</h1>
          <p className="fn-page-subtitle mb-0">
            Register a new supplier partner on the platform.
          </p>
        </div>
        <KButton
          type="button"
          label="Back to list"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate("/dashboard/suppliers")}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-fluid fn-saas-form">
        <FormSection
          icon="pi pi-user"
          title="Account"
          description="Login credentials and contact details for this supplier user."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="name"
              control={control}
              label="Full name"
              htmlFor="name"
              render={(field, fieldState) => (
                <KInputText id="name" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="email"
              control={control}
              label="Email address"
              htmlFor="email"
              render={(field, fieldState) => (
                <KInputText
                  id="email"
                  type="email"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="password"
              control={control}
              label="Password"
              htmlFor="password"
              render={(field, fieldState) => (
                <KPassword
                  id="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  toggleMask
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="phone"
              control={control}
              label="Phone"
              htmlFor="phone"
              render={(field, fieldState) => (
                <KInputText id="phone" {...field} className={fieldClassName(fieldState)} />
              )}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-building"
          title="Company"
          description="Business identity shown across RFQs and supplier directories."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="companyName"
              control={control}
              label="Company name"
              htmlFor="companyName"
              render={(field, fieldState) => (
                <KInputText id="companyName" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="tradeLicenseNumber"
              control={control}
              label="Trade license / registration number"
              htmlFor="tradeLicenseNumber"
              render={(field, fieldState) => (
                <KInputText
                  id="tradeLicenseNumber"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="countryOfRegistration"
              control={control}
              label="Country of registration"
              htmlFor="countryOfRegistration"
              render={(field, fieldState) => (
                <KInputText
                  id="countryOfRegistration"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="contactPerson"
              control={control}
              label="Contact person"
              htmlFor="contactPerson"
              render={(field, fieldState) => (
                <KInputText id="contactPerson" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="websiteUrl"
              control={control}
              label="Website URL"
              htmlFor="websiteUrl"
              render={(field, fieldState) => (
                <KInputText
                  id="websiteUrl"
                  placeholder="https://example.com"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="address"
              control={control}
              label="Address"
              htmlFor="address"
              render={(field, fieldState) => (
                <KInputText id="address" {...field} className={fieldClassName(fieldState)} />
              )}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-cog"
          title="Capabilities"
          description="Services offered, process tags, and ITAR registration."
        >
          <div className="fn-form-grid">
            <ValidatedField
              name="services"
              control={control}
              label="Services"
              htmlFor="services"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KMultiSelect
                  id="services"
                  value={field.value}
                  options={serviceOptions}
                  onChange={(e) => field.onChange(e.value)}
                  onBlur={field.onBlur}
                  placeholder="Select services"
                  display="chip"
                  filter
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <div className="fn-form-full fn-toggle-row">
              <div>
                <div className="fn-toggle-label">ITAR registered</div>
                <div className="fn-toggle-hint">
                  Supplier is registered for International Traffic in Arms Regulations
                </div>
              </div>
              <ValidatedField
                name="itarRegistered"
                control={control}
                label=""
                htmlFor="itarRegistered"
                className="fn-toggle-control"
                render={(field) => (
                  <KInputSwitch
                    inputId="itarRegistered"
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.value)}
                  />
                )}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-verified"
          title="Certifications"
          description="AS9100 and ISO 9001 status, expiry, and certificate files."
        >
          <div className="fn-cert-grid">
            <CertBlock
              control={control}
              type="AS9100"
              index={0}
              file={files.cert_AS9100}
              onFileChange={(f) => setFiles((prev) => ({ ...prev, cert_AS9100: f }))}
            />
            <CertBlock
              control={control}
              type="ISO9001"
              index={1}
              file={files.cert_ISO9001}
              onFileChange={(f) => setFiles((prev) => ({ ...prev, cert_ISO9001: f }))}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-folder-open"
          title="Documents"
          description="Upload capability profiles and brochures. Multi-select or add more anytime."
        >
          <div className="fn-docs-grid">
            <DocumentListField
              id="capabilityProfile"
              label="Capability profile"
              pending={files.capabilityProfile}
              onPendingChange={(next) =>
                setFiles((prev) => ({ ...prev, capabilityProfile: next }))
              }
            />
            <DocumentListField
              id="brochures"
              label="Brochures"
              pending={files.brochures}
              onPendingChange={(next) => setFiles((prev) => ({ ...prev, brochures: next }))}
            />
          </div>
        </FormSection>

        <FormSection
          icon="pi pi-comment"
          title="Comments"
          description="Internal notes about this supplier."
        >
          <ValidatedField
            name="comments"
            control={control}
            label="Comments"
            htmlFor="comments"
            render={(field, fieldState) => (
              <textarea
                id="comments"
                rows={4}
                {...field}
                className={`fn-textarea ${fieldClassName(fieldState)}`.trim()}
                placeholder="Anything worth noting about this supplier…"
              />
            )}
          />
        </FormSection>

        {submitError ? <small className="p-error fn-form-error">{submitError}</small> : null}

        <div className="fn-form-sticky-actions">
          <KButton
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            onClick={() => navigate("/dashboard/suppliers")}
          />
          <KButton type="submit" label="Create supplier" icon="pi pi-check" loading={loading} />
        </div>
      </form>
    </div>
  );
}
