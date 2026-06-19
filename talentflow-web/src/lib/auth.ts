// Funções auxiliares para gerenciar a sessão de autenticação no lado do cliente

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
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

export interface AuthSession {
  token: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
}

export function getSession(): AuthSession {
  return {
    token: getCookie('token') || null,
    role: getCookie('user_role') || null,
    name: getCookie('user_name') || null,
    email: getCookie('user_email') || null,
  };
}

export function setSession(token: string, role: string, name: string, email: string) {
  setCookie('token', token, 7);
  setCookie('user_role', role, 7);
  setCookie('user_name', name, 7);
  setCookie('user_email', email, 7);
}

export function clearSession() {
  deleteCookie('token');
  deleteCookie('user_role');
  deleteCookie('user_name');
  deleteCookie('user_email');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getCookie('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
