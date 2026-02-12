export async function httpJson(url, options = {}) {
  if (import.meta?.env?.DEV) {
    // eslint-disable-next-line no-console
    console.log("[http] request", url, options);
  }
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || res.statusText || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
