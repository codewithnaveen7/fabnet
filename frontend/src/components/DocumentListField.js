import React, { useRef } from "react";
import { KButton } from "kdesigns/KDesign";

const MAX_FILES = 5;

function formatSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconClass(name = "") {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pi pi-file-pdf";
  if (/\.(png|jpe?g|webp|gif)$/.test(lower)) return "pi pi-image";
  return "pi pi-file";
}

/**
 * In-form document CRUD: multi-select / add more, list existing + pending, remove.
 */
export default function DocumentListField({
  id,
  label,
  hint = "PDF or images, up to 5 files",
  accept = ".pdf,image/*,.doc,.docx",
  existing = [],
  pending = [],
  onPendingChange,
  onRemoveExisting,
  onDownloadExisting,
  maxFiles = MAX_FILES,
}) {
  const inputRef = useRef(null);
  const remaining = Math.max(0, maxFiles - existing.length - pending.length);
  const atLimit = remaining === 0;

  const openPicker = () => {
    if (atLimit) return;
    inputRef.current?.click();
  };

  const handlePick = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (!picked.length || atLimit) return;
    const next = [...pending, ...picked].slice(0, Math.max(0, maxFiles - existing.length));
    onPendingChange(next);
  };

  return (
    <div className="fn-doc-field">
      <div className="fn-doc-field-header">
        <label htmlFor={id} className="fn-field-label">
          {label}
        </label>
        <span className="fn-doc-count">
          {existing.length + pending.length}/{maxFiles}
        </span>
      </div>

      <button
        type="button"
        className={`fn-dropzone${atLimit ? " fn-dropzone--disabled" : ""}`}
        onClick={openPicker}
        disabled={atLimit}
      >
        <i className="pi pi-cloud-upload fn-dropzone-icon" aria-hidden />
        <span className="fn-dropzone-title">
          {atLimit ? "Maximum files reached" : "Click to add files"}
        </span>
        <span className="fn-dropzone-hint">{hint}</span>
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={handlePick}
      />

      {existing.length || pending.length ? (
        <ul className="fn-doc-list">
          {existing.map((doc) => (
            <li key={doc.id} className="fn-doc-row">
              <div className="fn-doc-meta">
                <i className={`${fileIconClass(doc.fileName)} fn-doc-icon`} aria-hidden />
                <div>
                  <div className="fn-doc-name">{doc.fileName}</div>
                  <div className="fn-doc-sub">
                    Saved
                    {doc.fileSize != null ? ` · ${formatSize(doc.fileSize)}` : ""}
                  </div>
                </div>
              </div>
              <div className="fn-doc-actions">
                {onDownloadExisting ? (
                  <KButton
                    type="button"
                    icon="pi pi-download"
                    rounded
                    text
                    size="small"
                    aria-label="Download"
                    onClick={() => onDownloadExisting(doc)}
                  />
                ) : null}
                <KButton
                  type="button"
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  size="small"
                  aria-label="Remove"
                  onClick={() => onRemoveExisting?.(doc)}
                />
              </div>
            </li>
          ))}
          {pending.map((file, index) => (
            <li key={`pending-${file.name}-${file.size}-${index}`} className="fn-doc-row">
              <div className="fn-doc-meta">
                <i className={`${fileIconClass(file.name)} fn-doc-icon`} aria-hidden />
                <div>
                  <div className="fn-doc-name">{file.name}</div>
                  <div className="fn-doc-sub">New · {formatSize(file.size)}</div>
                </div>
              </div>
              <div className="fn-doc-actions">
                <KButton
                  type="button"
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  size="small"
                  aria-label="Remove"
                  onClick={() =>
                    onPendingChange(pending.filter((_, i) => i !== index))
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="fn-doc-empty">No files yet. Multi-select or add more anytime.</p>
      )}
    </div>
  );
}
