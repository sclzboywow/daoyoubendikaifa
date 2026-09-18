import { authUsers } from '@server/lib/auth/schema';
import type { AuthUser } from '@server/lib/auth/types';
import { db } from '@server/lib/drizzle/db';
import { eq } from 'drizzle-orm';

const DEV_USER_EMAIL = 'dev@localhost';
const DEV_USER_NAME = '本地道友';

let cachedUser: AuthUser | null = null;
let loggedBypass = false;

export function isDevAuthBypassEnabled() {
  return (
    process.env.DEV_SKIP_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}

export async function ensureDevAuthUser(): Promise<AuthUser> {
  if (cachedUser) {
    return cachedUser;
  }

  const existing = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
      name: authUsers.name,
    })
    .from(authUsers)
    .where(eq(authUsers.email, DEV_USER_EMAIL))
    .limit(1);

  const row = existing[0];
  if (row) {
    cachedUser = row;
    logBypassOnce(row);
    return row;
  }

  const [created] = await db
    .insert(authUsers)
    .values({
      email: DEV_USER_EMAIL,
      name: DEV_USER_NAME,
      emailVerified: true,
    })
    .returning({
      id: authUsers.id,
      email: authUsers.email,
      name: authUsers.name,
    });

  if (!created) {
    throw new Error('Failed to create local development user');
  }

  cachedUser = created;
  logBypassOnce(created);
  return created;
}

function logBypassOnce(user: AuthUser) {
  if (loggedBypass) {
    return;
  }

  loggedBypass = true;
  console.info('[auth] local login bypass enabled', {
    email: user.email,
    userId: user.id,
  });
}
