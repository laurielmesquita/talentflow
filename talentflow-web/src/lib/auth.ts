export function getCookie(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax${secureFlag}`;
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax${secureFlag}`;
}

// Decodifica o payload de um JWT (segunda parte, base64url) sem validar a assinatura.
// A assinatura e validada apenas pelo backend (FastAPI); no front-end o payload e
// apenas lido para exibicao (role, name, email). Nenhum dado de sessao sensivel
// beyond role/name/email e confiado a partir do decode; toda autorização real
// acontece no backend via verificação do JWT assinado.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface AuthSession {
  token: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
}

export function getSession(): AuthSession {
  const token = getCookie('token') || null;
  if (!token) {
    return { token: null, role: null, name: null, email: null };
  }
  // Deriva role/email/name do payload do JWT (HS256) em vez de duplicar como cookie
  // legível por XSS. Antes tínhamos 4 cookies (token, user_role, user_name,
  // user_email); agora mantemos apenas o token e lemos claims do payload.
  const payload = decodeJwtPayload(token);
  return {
    token,
    role: typeof payload?.role === 'string' ? payload.role : null,
    name: typeof payload?.name === 'string' ? payload.name : null,
    email: typeof payload?.email === 'string' ? payload.email : null,
  };
}

export function setSession(token: string, _role?: string, _name?: string, _email?: string) {
  // Mantemos apenas o cookie `token`. Os claims role/email/name são lidos do
  // payload do JWT em getSession(), sem cookies de metadata adicionais que
  // seriam PII exposed to XSS ou divergentes do token real.
  void _role; void _name; void _email;
  setCookie('token', token, 7);
}

export function clearSession() {
  deleteCookie('token');
}
