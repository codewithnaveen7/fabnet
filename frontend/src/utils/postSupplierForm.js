import { axiosInstance } from "kdesigns/KDesign";
import { getToken } from "./storage";

/**
 * Post supplier create/update as multipart (JSON payload + optional files).
 * Bypasses kdesigns JSON transformRequest so FormData is preserved.
 */
export async function postSupplierForm(url, payload, files = {}, eventType) {
  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  form.append("eventType", eventType);

  if (files.cert_AS9100) form.append("cert_AS9100", files.cert_AS9100);
  if (files.cert_ISO9001) form.append("cert_ISO9001", files.cert_ISO9001);

  const profiles = Array.isArray(files.capabilityProfile)
    ? files.capabilityProfile
    : files.capabilityProfile
      ? [files.capabilityProfile]
      : [];
  profiles.forEach((file) => {
    if (file) form.append("capabilityProfile", file);
  });

  if (Array.isArray(files.brochures)) {
    files.brochures.forEach((file) => {
      if (file) form.append("brochures", file);
    });
  }

  const token = getToken();
  const response = await axiosInstance.post(url, form, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Let the browser set multipart boundary
      "Content-Type": undefined,
    },
    transformRequest: [(data) => data],
  });

  return { data: response?.data?.eventMessage || response?.data };
}
