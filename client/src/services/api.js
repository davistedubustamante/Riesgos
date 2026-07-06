// Cliente HTTP minimalista.
// credentials: 'include' -> el navegador envía la cookie httpOnly rf_session en cada request.
// Skip-Auth-redirect: la página de login no debe redirigirse a sí misma cuando falla el login.

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body, headers = {}, skipAuthRedirect, ...rest } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.details = data.errors || data.details;
    // Notificar expiración de sesión para que AuthContext limpie el user.
    // OJO: si la llamada fue /auth/login o /auth/me o /auth/register en contexto de bootstrap,
    // no disparamos redirect (porque esa página YA maneja el error).
    if (res.status === 401 && !skipAuthRedirect) {
      window.dispatchEvent(new CustomEvent('rf:unauthorized', { detail: { path } }));
    }
    throw error;
  }
  return data;
}

export const api = {
  get: (p, opts) => request(p, { ...opts }),
  post: (p, body, opts) => request(p, { method: 'POST', body, ...opts }),
  put: (p, body, opts) => request(p, { method: 'PUT', body, ...opts }),
  del: (p, opts) => request(p, { method: 'DELETE', ...opts }),
};
