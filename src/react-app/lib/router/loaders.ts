import { authClient } from '@app/lib/auth/client';
import { replace, type LoaderFunctionArgs } from 'react-router';
import type {
  AdminLoaderData,
  AuthLoaderData,
  UserLoaderData,
} from './routeData';

type SessionResult = Awaited<ReturnType<typeof authClient.getSession>>;
type SessionData = SessionResult['data'];

type AdminSessionResponse = {
  success?: boolean;
  userId?: string;
  email?: string;
  error?: string;
};

type AuthAnnouncementResponse = {
  success?: boolean;
  announcement?: string | null;
  error?: string;
};

const PASSWORD_RECOVERY_PATHS = new Set([
  '/forgot-password',
  '/reset-password',
]);

async function hasAuthenticatedUser(request: Request) {
  const session = await resolveSessionData(request);

  return Boolean(session?.user);
}

type DevSessionResponse = {
  enabled?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

async function resolveDevBypassSession(
  request: Request,
): Promise<SessionData | null> {
  if (!import.meta.env.DEV) {
    return null;
  }

  try {
    const response = await fetch('/api/dev/session', {
      cache: 'no-store',
      credentials: 'include',
      signal: request.signal,
    });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as DevSessionResponse;
    if (!payload.enabled || !payload.user) {
      return null;
    }

    return {
      user: payload.user,
    } as SessionData;
  } catch {
    return null;
  }
}

async function resolveSessionData(
  request: Request,
): Promise<SessionData | null> {
  const bypassSession = await resolveDevBypassSession(request);
  if (bypassSession) {
    return bypassSession;
  }

  try {
    const result = await authClient.getSession({
      fetchOptions: {
        cache: 'no-store',
        signal: request.signal,
      },
    });

    return result.data ?? null;
  } catch {
    return null;
  }
}

export async function indexRedirectLoader({ request }: LoaderFunctionArgs) {
  const session = await resolveSessionData(request);

  return session?.user ? replace('/game') : replace('/login');
}

export async function guestOnlyLoader({ request }: LoaderFunctionArgs) {
  return (await hasAuthenticatedUser(request)) ? replace('/game') : null;
}

export async function authLayoutLoader({
  request,
}: LoaderFunctionArgs): Promise<AuthLoaderData | Response> {
  const pathname = new URL(request.url).pathname;
  if (
    !PASSWORD_RECOVERY_PATHS.has(pathname) &&
    (await hasAuthenticatedUser(request))
  ) {
    return replace('/game');
  }

  try {
    const response = await fetch('/api/community/announcement', {
      cache: 'no-store',
      credentials: 'include',
      signal: request.signal,
    });
    const payload = (await response.json()) as AuthAnnouncementResponse;

    if (!response.ok || !payload.success) {
      return { announcement: null };
    }

    return {
      announcement: payload.announcement?.trim() || null,
    };
  } catch {
    return { announcement: null };
  }
}

export async function requireUserLoader({
  request,
}: LoaderFunctionArgs): Promise<UserLoaderData | Response> {
  const session = await resolveSessionData(request);
  const user = session?.user;

  return user ? { userId: user.id } : replace('/login');
}

export async function requireAdminLoader({
  request,
}: LoaderFunctionArgs): Promise<AdminLoaderData | Response> {
  if (!(await hasAuthenticatedUser(request))) {
    return replace('/login');
  }

  const response = await fetch('/api/admin/session', {
    cache: 'no-store',
    credentials: 'include',
    signal: request.signal,
  });
  const payload = (await response.json()) as AdminSessionResponse;

  if (response.status === 401) {
    return replace('/login');
  }

  if (response.status === 403) {
    return replace('/game');
  }

  if (!response.ok || !payload.userId || !payload.email) {
    throw new Error(payload.error ?? '加载管理员会话失败');
  }

  return {
    adminUserId: payload.userId,
    adminEmail: payload.email,
  };
}
