import {
  ensureDevAuthUser,
  isDevAuthBypassEnabled,
} from '@server/lib/auth/devAuthBypass';
import type { AppEnv } from '@server/lib/hono/types';
import { Hono } from 'hono';

const router = new Hono<AppEnv>();

router.get('/session', async (c) => {
  if (!isDevAuthBypassEnabled()) {
    return c.json({ enabled: false }, 404);
  }

  const user = await ensureDevAuthUser();
  return c.json({
    enabled: true,
    user,
  });
});

export default router;
