export function unwrapApiData(result) {
  const payload = result?.data;
  if (payload?.data !== undefined) return payload.data;
  return payload ?? null;
}
