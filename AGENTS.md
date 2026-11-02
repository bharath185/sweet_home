# Antigravity Pair-Programming & System Guidelines

Refer to [GEMINI.md](file:///d:/PROJECTS/sweethome/GEMINI.md) for full architecture context, Supabase configuration, active Vercel project IDs, and live payment gateways.

### Key Workflows:
1. **Frontend**: Located in [frontend-nextjs](file:///d:/PROJECTS/sweethome/frontend-nextjs). All environment keys live in `frontend-nextjs/.env.local` (template: `frontend-nextjs/.env.example`).
2. **Pricing Rules**: Always query `/api/payment-config` or Supabase `plans` table. Never hardcode prices or rely on `localStorage` caches.
3. **Deployments**: Vercel project `decofrog3d` under team `prigenixsoftware-a11ys-projects` maps to custom domains `decofrog3d.com` and `www.decofrog3d.com`.
