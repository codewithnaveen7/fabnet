import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  KButton,
  KInputText,
  KMultiSelect,
  KPassword,
} from "kdesigns/KDesign";
import { useMutationPost } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import { addSupplierSchema } from "../validation/schemas";
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

const defaultValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  companyName: "",
  contactPerson: "",
  address: "",
  services: [],
};

export default function AddSupplierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { postData, loading } = useMutationPost({ mutationKey: ["fabnet-supplier-create"] });
  const [submitError, setSubmitError] = useState("");

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(addSupplierSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      const result = await postData(
        values,
        "FABNET_CREATE_SUPPLIER",
        "/suppliers/create",
      );
      if (unwrapApiData(result)) {
        await queryClient.invalidateQueries({
          queryKey: ["queryGet", "suppliers", "list", "/suppliers"],
        });
        navigate("/dashboard/suppliers");
      }
    } catch {
      setSubmitError("Unable to create supplier. Please check the form and try again.");
    }
  };

  return (
    <div>
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
                <KInputText
                  id="name"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
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
                <KInputText
                  id="phone"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="companyName"
              control={control}
              label="Company name"
              htmlFor="companyName"
              render={(field, fieldState) => (
                <KInputText
                  id="companyName"
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
                <KInputText
                  id="contactPerson"
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
              className="fn-form-full"
              render={(field, fieldState) => (
                <KInputText
                  id="address"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
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
              <KButton type="submit" label="Create supplier" loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
