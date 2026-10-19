-- DecoFrog 3D Studio Supabase Database Schema
-- Run this in the Supabase Dashboard -> SQL Editor -> New Query -> Run

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'CLIENT', -- 'ADMIN' | 'DESIGNER' | 'CLIENT'
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid' | 'pending' | 'paid' | 'expired'
  plan TEXT, -- 'trial_2days' | 'monthly' | 'yearly'
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  is_free_trial BOOLEAN DEFAULT FALSE,
  has_completed_trial BOOLEAN DEFAULT FALSE,
  cashfree_order_id TEXT,
  cashfree_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries by email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. PROJECTS TABLE (Cross-device 3D floor plan syncing)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  data JSONB NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast project listing by user
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_email ON public.projects(user_email);

-- 3. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  payment_id TEXT,
  user_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  plan_id TEXT,
  plan_name TEXT,
  amount NUMERIC NOT NULL,
  gateway TEXT DEFAULT 'cashfree',
  status TEXT DEFAULT 'PENDING', -- 'PAID' | 'REFUNDED' | 'FAILED' | 'PENDING' | 'USER_DROPPED'
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  raw_event JSONB
);

-- Index for transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_email ON public.payment_transactions(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);

-- 4. APP CONFIGURATION TABLE (Dynamic admin payment keys & plan prices)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEMPLATES TABLE (Architectural & Demo Design Templates)
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Apartment',
  description TEXT,
  floors INTEGER DEFAULT 1,
  area TEXT,
  badge TEXT,
  thumbnail TEXT,
  data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DISABLE ROW LEVEL SECURITY (RLS) FOR INITIAL SEAMLESS SETUP
-- (You can enable RLS policies later once authentication is locked down)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for application API with anon/service keys
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to templates" ON public.templates;
CREATE POLICY "Allow all access to templates" ON public.templates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to transactions" ON public.payment_transactions;
CREATE POLICY "Allow all access to transactions" ON public.payment_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to app_config" ON public.app_config;
CREATE POLICY "Allow all access to app_config" ON public.app_config FOR ALL USING (true) WITH CHECK (true);

-- 6. PRE-SEED SUPERADMIN USERS WITH LIFETIME ACCESS
INSERT INTO public.users (id, email, name, role, payment_status, plan, expires_at)
VALUES 
  ('admin_1', 'admin@decofrog3d.io', 'Studio Superadmin', 'ADMIN', 'paid', 'yearly', '2099-12-31T23:59:59.999Z'),
  ('admin_2', 'admin@visualrendered.io', 'Lead Architect Admin', 'ADMIN', 'paid', 'yearly', '2099-12-31T23:59:59.999Z')
ON CONFLICT (email) DO UPDATE 
SET role = 'ADMIN', payment_status = 'paid', expires_at = '2099-12-31T23:59:59.999Z';
