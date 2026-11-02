# Antigravity Context & Architecture Guide: DecoFrog 3D

## 1. Project Overview & Live Environment
- **Product Name**: DecoFrog 3D (SweetHome 3D Visual Studio)
- **Live Production URL**: [https://decofrog3d.com](https://decofrog3d.com) / [https://www.decofrog3d.com](https://www.decofrog3d.com)
- **Vercel Deployment URL**: [https://decofrog3d.vercel.app](https://decofrog3d.vercel.app)
- **Vercel Account**: `prigenixsoftware@gmail.com`
  - **Team ID**: `team_4vKF1DEVQnMusUXWNnyzVMMB` (`prigenixsoftware-a11ys-projects`)
  - **Project ID**: `prj_ZKbFVbu8318QxXF3yBzI9pYqu930` (`decofrog3d`)
- **DNS / CDN**: Cloudflare Nameservers (`chan.ns.cloudflare.com`, `clyde.ns.cloudflare.com`)
- **GitHub Repository**: `https://github.com/bharath185/sweet_home.git` (Branch: `master`)

---

## 2. Architecture & Components
1. **Frontend (`frontend-nextjs`)**:
   - Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Ant Design.
   - Runs on port `3000`.
   - Core 3D studio, floor drafting, raytracing preview, user login modal, payment pass modal, admin panel.
2. **Backend API (`frontend-nextjs/src/app/api`)**:
   - Serverless Next.js API routes handling Auth (Google OAuth, Gmail OTP, Password Reset), Payments (Razorpay & Cashfree Webhooks), Projects, and Pricing.
3. **Database (Supabase Cloud)**:
   - Supabase PostgreSQL: `https://tviakpxdnomilnukbjtw.supabase.co`
   - Real-time client & Service Role client in `frontend-nextjs/src/lib/supabaseDb.ts`.
4. **Spring Boot Backend (Optional local SweetHome Java runtime)**:
   - Java Spring Boot application in root / `backend` running on port `8090`.

---

## 3. Strict Business Rules & Logic
1. **Dynamic Pricing (Zero Hardcoded Stale Prices)**:
   - All subscription prices and plan metadata MUST be loaded dynamically from the Supabase DB via `/api/payment-config`.
   - Never cache subscription prices in `localStorage` or `sessionStorage`.
   - Active Plans:
     - **24-Hour Full Access Pass**: ₹51 (Duration: 1 Day / 24 Hours)
     - **Monthly Pro Pass**: ₹199 (Duration: 30 Days)
     - **Annual Pro Pass**: ₹1,999 (Duration: 365 Days)
2. **Branding**:
   - Official brand name is **DecoFrog 3D**.
   - Email notifications (OTP, Login credentials, Password reset) use `"DecoFrog 3D" <contact@prigenix.com>`.
   - App URL in emails points to `https://decofrog3d.com` (NEVER `localhost:3000` in production).
3. **Authentication**:
   - Gmail OTP Dispatch: Uses Gmail SMTP via `contact@prigenix.com`.
   - Google Social Login: Restricted to `@gmail.com` / `@googlemail.com` accounts. Non-Gmail users must use email OTP.

---

## 4. Environment Variables Reference
Copy `frontend-nextjs/.env.example` to `frontend-nextjs/.env.local`.
All 20 production variables are already populated in Vercel project `decofrog3d`.
To pull environment variables directly on a new machine using Vercel CLI:
```bash
cd frontend-nextjs
npx vercel env pull .env.local
```

---

## 5. Development & Deployment Commands
```bash
# 1. Install dependencies
cd frontend-nextjs
npm install

# 2. Run local development
npm run dev

# 3. Production Build Test
npm run build

# 4. Deploy to Vercel Production
npx vercel --prod
```
