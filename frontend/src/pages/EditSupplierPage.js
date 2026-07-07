import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  KButton,
  KDropdown,
  KInputText,
  KMultiSelect,
  KPassword,
  KProgressSpinner,
} from "kdesigns/KDesign";
import { useMutationPost, useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import { editSupplierSchema } from "../validation/schemas";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

const SERVICE_OPTIONS = [
  { label: "Design", value: "DESIGN" },
  { label: "Manufacturing", value: "MANUFACTURING" },
  { label: "Inspection", value: "INSPECTION" },
  { label: "Logistics", value: "LOGISTICS" },
  { label: "Packaging", value: "PACKAGING" },
  { label: "Certification", value: "CERTIFICATION" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export default function EditSupplierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { postData, loading: saving } = useMutationPost({ mutationKey: ["fabnet-supplier-update"] });
  const [submitError, setSubmitError] = useState("");

  const { data, isLoading } = useQueryGet({
    eventMessage: { id },
    eventType: "FABNET_GET_SUPPLIER",
    url: "/suppliers/get",
    enabled: Boolean(id),
    queryKey: ["suppliers", "detail", id],
    select: (result) => unwrapApiData(result),
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(editSupplierSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      companyName: "",
      contactPerson: "",
      address: "",
      services: [],
      status: "ACTIVE",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name || "",
      email: data.email || "",
      password: "",
      phone: data.phone || data.supplierProfile?.phone || "",
      companyName: data.supplierProfile?.companyName || "",
      contactPerson: data.supplierProfile?.contactPerson || "",
      address: data.supplierProfile?.address || "",
      services: data.supplierProfile?.services?.map((s) => s.serviceType) || [],
      status: data.status || "ACTIVE",
    });
  }, [data, reset]);

  const onSubmit = async (values) => {
    setSubmitError("");
    const payload = { id, ...values };
    if (!payload.password) {
      delete payload.password;
    }
    try {
      const result = await postData(payload, "FABNET_UPDATE_SUPPLIER", "/suppliers/update");
      if (unwrapApiData(result)) {
        await queryClient.invalidateQueries({
          queryKey: ["queryGet", "suppliers", "list", "/suppliers"],
        });
        navigate("/dashboard/suppliers");
      }
    } catch {
      setSubmitError("Unable to update supplier. Please check the form and try again.");
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
          <h1 className="fn-page-title">Edit supplier</h1>
          <p className="fn-page-subtitle mb-0">Update supplier account and company details.</p>
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

      <div className="fn-panel">
        <div className="fn-panel-header">
          <h3>Supplier details</h3>
        </div>
        <div className="fn-panel-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-fluid fn-form-grid">
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
              label="New password (optional)"
              htmlFor="password"
              render={(field, fieldState) => (
                <KPassword
                  id="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  toggleMask
                  feedback={false}
                  placeholder="Leave blank to keep current"
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
              name="contactPerson"
              control={control}
              label="Contact person"
              htmlFor="contactPerson"
              render={(field, fieldState) => (
                <KInputText id="contactPerson" {...field} className={fieldClassName(fieldState)} />
              )}
            />
            <ValidatedField
              name="status"
              control={control}
              label="Account status"
              htmlFor="status"
              render={(field, fieldState) => (
                <KDropdown
                  id="status"
                  value={field.value}
                  options={STATUS_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  onBlur={field.onBlur}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="address"
              control={control}
              label="Address"
              htmlFor="address"
              className="fn-form-full"
              render={(field, fieldState) => (
                <KInputText id="address" {...field} className={fieldClassName(fieldState)} />
              )}
            />
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
                  options={SERVICE_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  onBlur={field.onBlur}
                  placeholder="Select services"
                  display="chip"
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            {submitError ? (
              <small className="p-error fn-form-full">{submitError}</small>
            ) : null}
            <div className="fn-form-actions fn-form-full">
              <KButton
                type="button"
                label="Cancel"
                severity="secondary"
                outlined
                onClick={() => navigate("/dashboard/suppliers")}
              />
              <KButton type="submit" label="Save changes" loading={saving} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
