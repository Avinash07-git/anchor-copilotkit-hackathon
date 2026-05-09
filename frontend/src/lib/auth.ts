export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

const AUTH_HEADERS = { 'Content-Type': 'application/json' };

export async function register(credentials: AuthCredentials): Promise<AuthUser> {
  return authJson<AuthUser>('/api/auth/register', {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify(credentials),
  });
}

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  return authJson<AuthUser>('/api/auth/login', {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify(credentials),
  });
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(await readError(res));
  }
}

export async function currentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return (await res.json()) as AuthUser;
}

async function authJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return (await res.json()) as T;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string };
    if (body.detail) return body.detail;
  } catch {
    // Fall back to the status text below when the body is empty or non-JSON.
  }
  return `Request failed: HTTP ${res.status}`;
}
