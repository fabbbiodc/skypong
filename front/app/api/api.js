
// Shared in-flight refresh promise so concurrent 401s only trigger one refresh
let refreshInFlight = null;

function getCSRF() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1];
}

async function tryRefresh() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const csrf = getCSRF();
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-csrf-token': csrf || '' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export default async function api(url, { method = "GET", body, headers } = {}) {
  const doFetch = () =>
    fetch(url, {
      method,
      credentials: "include",
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  let res = await doFetch();

  // On 401, attempt a single token refresh and retry
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Update CSRF header if the caller included one
      if (headers && typeof headers === 'object' && 'x-csrf-token' in headers) {
        headers = { ...headers, 'x-csrf-token': getCSRF() || '' };
      }
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.code || `HTTP ${res.status}`);
  }
  return res.json();
}
