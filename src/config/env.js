/** The one place the backend origin is configured. */
const PRODUCTION_API_URL = 'https://api.momentkaph.sk';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

/**
 * Empty string on localhost — i.e. same-origin '/cloud_storage/...' requests,
 * which the dev server proxies to PRODUCTION_API_URL. The detour exists because
 * the backend's CORS allowlist only names momentkaph.sk, so a direct call from
 * localhost is rejected by the browser. See scripts/serve.js.
 *
 * To point at a local backend instead, from the devtools console:
 *   localStorage.setItem('apiUrl', 'http://localhost:8080'); location.reload();
 */
export const apiUrl =
  localStorage.getItem('apiUrl') ?? (LOCAL_HOSTNAMES.includes(location.hostname) ? '' : PRODUCTION_API_URL);
