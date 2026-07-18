import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KButton,
  KColumn,
  KDataTable,
  KDialog,
  KDropdown,
  KInputText,
  KProgressSpinner,
  KTag,
} from "kdesigns/KDesign";
import { useMutationPost, useQueryGet } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import { serviceSchema } from "../validation/schemas";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const emptyForm = { name: "", description: "", status: "ACTIVE" };

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const { postData: saveService, loading: saving } = useMutationPost({
    mutationKey: ["fabnet-service-save"],
  });
  const { postData: deleteService } = useMutationPost({
    mutationKey: ["fabnet-service-delete"],
  });

  const { data, isLoading } = useQueryGet({
    eventMessage: {},
    eventType: "FABNET_LIST_SERVICES",
    url: "/services",
    enabled: true,
    queryKey: ["services", "list"],
    select: (result) => unwrapApiData(result) ?? [],
  });

  const services = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: emptyForm,
    mode: "onTouched",
  });

  const openCreate = () => {
    setEditing(null);
    setSubmitError("");
    reset(emptyForm);
    setDialogVisible(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setSubmitError("");
    reset({
      name: row.name || "",
      description: row.description || "",
      status: row.status || "ACTIVE",
    });
    setDialogVisible(true);
  };

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      if (editing) {
        await saveService(
          { id: editing.id, ...values },
          "FABNET_UPDATE_SERVICE",
          "/services/update"
        );
      } else {
        await saveService(values, "FABNET_CREATE_SERVICE", "/services/create");
      }
      await queryClient.invalidateQueries({ queryKey: ["queryGet", "services"] });
      setDialogVisible(false);
    } catch {
      setSubmitError("Unable to save service. Please try again.");
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      `Remove or deactivate service "${row.name}"? Linked suppliers will keep the link but inactive services are hidden from new selections.`
    );
    if (!confirmed) return;
    setDeletingId(row.id);
    try {
      await deleteService({ id: row.id }, "FABNET_DELETE_SERVICE", "/services/delete");
      await queryClient.invalidateQueries({ queryKey: ["queryGet", "services"] });
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
          <h1 className="fn-page-title">Services</h1>
          <p className="fn-page-subtitle mb-0">
            Manage the service catalog used when adding suppliers.
          </p>
        </div>
        <KButton type="button" label="Add service" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <div className="fn-panel">
        <div className="fn-panel-body">
          <KDataTable value={services} paginator rows={10} emptyMessage="No services yet.">
            <KColumn field="name" header="Name" sortable />
            <KColumn field="description" header="Description" />
            <KColumn
              field="status"
              header="Status"
              body={(row) => (
                <KTag
                  value={row.status}
                  severity={row.status === "ACTIVE" ? "success" : "danger"}
                />
              )}
            />
            <KColumn
              header="Actions"
              body={(row) => (
                <div className="fn-table-actions">
                  <KButton
                    type="button"
                    icon="pi pi-pencil"
                    severity="secondary"
                    outlined
                    size="small"
                    onClick={() => openEdit(row)}
                  />
                  <KButton
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    size="small"
                    loading={deletingId === row.id}
                    onClick={() => handleDelete(row)}
                  />
                </div>
              )}
              style={{ width: "120px" }}
            />
          </KDataTable>
        </div>
      </div>

      <KDialog
        header={editing ? "Edit service" : "Add service"}
        visible={dialogVisible}
        style={{ width: "480px" }}
        className="fn-services-dialog"
        onHide={() => setDialogVisible(false)}
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-fluid fn-saas-form">
          <div className="fn-form-section">
            <div className="fn-form-section-header">
              <div className="fn-form-section-icon" aria-hidden>
                <i className="pi pi-list" />
              </div>
              <div>
                <h3 className="fn-form-section-title">Service details</h3>
                <p className="fn-form-section-desc">
                  Catalog entry shown in supplier service multi-selects.
                </p>
              </div>
            </div>
            <div className="fn-form-section-body">
              <ValidatedField
                name="name"
                control={control}
                label="Name"
                htmlFor="svc-name"
                render={(field, fieldState) => (
                  <KInputText id="svc-name" {...field} className={fieldClassName(fieldState)} />
                )}
              />
              <ValidatedField
                name="description"
                control={control}
                label="Description"
                htmlFor="svc-desc"
                render={(field, fieldState) => (
                  <KInputText id="svc-desc" {...field} className={fieldClassName(fieldState)} />
                )}
              />
              <ValidatedField
                name="status"
                control={control}
                label="Status"
                htmlFor="svc-status"
                render={(field, fieldState) => (
                  <KDropdown
                    id="svc-status"
                    value={field.value}
                    options={STATUS_OPTIONS}
                    onChange={(e) => field.onChange(e.value)}
                    className={fieldClassName(fieldState)}
                  />
                )}
              />
            </div>
          </div>
          {submitError ? <small className="p-error block mb-2">{submitError}</small> : null}
          <div className="fn-form-actions">
            <KButton
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              onClick={() => setDialogVisible(false)}
            />
            <KButton type="submit" label="Save" icon="pi pi-check" loading={saving} />
          </div>
        </form>
      </KDialog>
    </div>
  );
}
