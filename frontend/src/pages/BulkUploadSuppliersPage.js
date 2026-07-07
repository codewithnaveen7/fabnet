import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KButton, KColumn, KDataTable, KFileUpload, KTag } from "kdesigns/KDesign";
import { useMutationPost } from "kdesigns/KHooks";
import { useQueryClient } from "@tanstack/react-query";
import "kdesigns/kDesignStyle";
import { validateBulkSupplierRows } from "../validation/schemas";
import { downloadSupplierTemplate, parseSupplierCsv } from "../utils/supplierCsv";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

export default function BulkUploadSuppliersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { postData, loading } = useMutationPost({ mutationKey: ["fabnet-supplier-bulk"] });

  const [parseError, setParseError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  const validatedRows = useMemo(
    () => (parsedRows.length ? validateBulkSupplierRows(parsedRows) : []),
    [parsedRows],
  );

  const validRows = validatedRows.filter((row) => row.valid);
  const invalidCount = validatedRows.length - validRows.length;

  const handleFileUpload = (event) => {
    const file = event.files?.[0];
    if (!file) return;

    setParseError("");
    setSubmitError("");
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseSupplierCsv(e.target.result);
        setParsedRows(rows);
      } catch (err) {
        setParsedRows([]);
        setParseError(err.message || "Unable to parse CSV file.");
      }
    };
    reader.onerror = () => {
      setParseError("Unable to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    setSubmitError("");
    setUploadResult(null);

    if (!validRows.length) {
      setSubmitError("No valid rows to upload. Fix validation errors first.");
      return;
    }

    try {
      const result = await postData(
        { suppliers: validRows.map((row) => row.data) },
        "FABNET_BULK_SUPPLIERS",
        "/suppliers/bulk",
      );
      const summary = unwrapApiData(result);
      if (summary) {
        setUploadResult(summary);
        await queryClient.invalidateQueries({
          queryKey: ["queryGet", "suppliers", "list", "/suppliers"],
        });
      }
    } catch {
      setSubmitError("Bulk upload failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="fn-page-header">
        <div>
          <h1 className="fn-page-title">Bulk upload suppliers</h1>
          <p className="fn-page-subtitle mb-0">
            Import multiple suppliers from a CSV file (max 100 rows).
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

      <div className="fn-panel fn-bulk-upload-panel">
        <div className="fn-panel-header">
          <h3>Upload CSV</h3>
        </div>
        <div className="fn-panel-body">
          <p className="fn-bulk-hint">
            Required columns: <code>name</code>, <code>email</code>,{" "}
            <code>company_name</code>, <code>contact_person</code>. Optional:{" "}
            <code>password</code> (default Supplier@123), <code>phone</code>,{" "}
            <code>address</code>, <code>services</code> (pipe-separated, e.g. DESIGN|MANUFACTURING).
          </p>
          <div className="fn-bulk-actions">
            <KButton
              type="button"
              label="Download template"
              icon="pi pi-download"
              severity="secondary"
              outlined
              onClick={downloadSupplierTemplate}
            />
            <KFileUpload
              mode="basic"
              name="suppliersCsv"
              accept=".csv"
              maxFileSize={1000000}
              customUpload
              auto
              chooseLabel="Choose CSV file"
              uploadHandler={handleFileUpload}
            />
          </div>
          {parseError ? <small className="p-error block mt-2">{parseError}</small> : null}
        </div>
      </div>

      {validatedRows.length > 0 ? (
        <div className="fn-panel">
          <div className="fn-panel-header fn-bulk-preview-header">
            <h3>Preview</h3>
            <div className="fn-bulk-stats">
              <KTag value={`${validRows.length} valid`} severity="success" />
              {invalidCount > 0 ? (
                <KTag value={`${invalidCount} invalid`} severity="danger" />
              ) : null}
            </div>
          </div>
          <div className="fn-panel-body">
            <KDataTable
              className="fn-data-table"
              value={validatedRows}
              dataKey="row"
              paginator={validatedRows.length > 10}
              rows={10}
              emptyMessage="No rows"
              size="small"
            >
              <KColumn field="row" header="Row" style={{ width: "70px" }} />
              <KColumn
                field="data.companyName"
                header="Company"
                body={(item) => item.data?.companyName || item.data?.company_name || "—"}
              />
              <KColumn
                field="data.email"
                header="Email"
                body={(item) => item.data?.email || "—"}
              />
              <KColumn
                field="data.contactPerson"
                header="Contact"
                body={(item) => item.data?.contactPerson || item.data?.contact_person || "—"}
              />
              <KColumn
                header="Status"
                body={(item) => (
                  <KTag
                    value={item.valid ? "Valid" : "Invalid"}
                    severity={item.valid ? "success" : "danger"}
                  />
                )}
              />
              <KColumn
                header="Errors"
                body={(item) =>
                  item.errors?.length ? (
                    <small className="p-error">{item.errors.join(", ")}</small>
                  ) : (
                    "—"
                  )
                }
              />
            </KDataTable>

            {submitError ? <small className="p-error block mt-3">{submitError}</small> : null}

            <div className="fn-form-actions fn-form-full mt-3">
              <KButton
                type="button"
                label="Cancel"
                severity="secondary"
                outlined
                onClick={() => navigate("/dashboard/suppliers")}
              />
              <KButton
                type="button"
                label={`Upload ${validRows.length} supplier${validRows.length !== 1 ? "s" : ""}`}
                icon="pi pi-upload"
                loading={loading}
                disabled={!validRows.length}
                onClick={handleBulkUpload}
              />
            </div>
          </div>
        </div>
      ) : null}

      {uploadResult ? (
        <div className="fn-panel">
          <div className="fn-panel-header">
            <h3>Upload result</h3>
          </div>
          <div className="fn-panel-body">
            <p className="fn-bulk-summary">
              Created <strong>{uploadResult.createdCount}</strong> of{" "}
              <strong>{uploadResult.total}</strong> suppliers.
              {uploadResult.failedCount > 0 ? (
                <>
                  {" "}
                  <strong>{uploadResult.failedCount}</strong> failed.
                </>
              ) : null}
            </p>
            {uploadResult.failed?.length > 0 ? (
              <KDataTable
                className="fn-data-table mt-3"
                value={uploadResult.failed}
                dataKey="row"
                size="small"
              >
                <KColumn field="row" header="Row" />
                <KColumn field="email" header="Email" />
                <KColumn field="message" header="Error" />
              </KDataTable>
            ) : null}
            <div className="fn-form-actions fn-form-full mt-3">
              <KButton
                label="View suppliers"
                onClick={() => navigate("/dashboard/suppliers")}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
