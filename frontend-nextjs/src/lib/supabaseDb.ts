import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { UserPaymentRecord, PaymentTransactionRecord } from './paymentStore';

export interface DbUserRecord extends UserPaymentRecord {
  password_hash?: string;
  phone?: string;
  created_at?: string;
}

export interface DbProjectRecord {
  id: string;
  user_id?: string;
  user_email?: string;
  name: string;
  data: any;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbTemplateRecord {
  id: string;
  name: string;
  category: string;
  description?: string;
  floors: number;
  area?: string;
  badge?: string;
  thumbnail?: string;
  data: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Normalizes identifier
 */
function clean(str?: string | null): string {
  return (str || '').trim().toLowerCase();
}

/**
 * 1. Find user by email, phone, or ID in Supabase
 */
export async function findUserInDb(identifier: string): Promise<DbUserRecord | null> {
  const admin = getSupabaseAdmin();
  if (!admin || !identifier) return null;

  try {
    const raw = identifier.trim();
    const isEmail = raw.includes('@');
    const isDigitsOnly = /^\d+$/.test(raw);

    let query = admin.from('users').select('*');

    if (isEmail) {
      query = query.ilike('email', raw);
    } else if (isDigitsOnly && raw.length >= 10) {
      query = query.or(`phone.eq.${raw},email.ilike.%${raw}%`);
    } else {
      query = query.or(`id.eq.${raw},email.ilike.${raw}`);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      console.warn('[SupabaseDb] findUserInDb error:', error.message);
      return null;
    }
    return data as DbUserRecord | null;
  } catch (err: any) {
    console.warn('[SupabaseDb] findUserInDb exception:', err.message);
    return null;
  }
}

/**
 * 2. Upsert user in Supabase
 */
export async function upsertUserInDb(user: Partial<DbUserRecord> & { email: string }): Promise<DbUserRecord | null> {
  const admin = getSupabaseAdmin();
  if (!admin || !user.email) return null;

  try {
    const payload = {
      id: user.id || `u_${Date.now()}`,
      email: user.email.trim().toLowerCase(),
      name: user.name || user.email.split('@')[0],
      phone: user.phone ? user.phone.trim() : null,
      role: user.role || (user.email.includes('admin') ? 'ADMIN' : 'DESIGNER'),
      payment_status: user.payment_status || 'unpaid',
      plan: user.plan || null,
      paid_at: user.paid_at || null,
      expires_at: user.expires_at || null,
      trial_started_at: user.trial_started_at || null,
      trial_expires_at: user.trial_expires_at || null,
      is_free_trial: user.is_free_trial ?? false,
      has_completed_trial: user.has_completed_trial ?? false,
      cashfree_order_id: user.cashfree_order_id || null,
      cashfree_payment_id: user.cashfree_payment_id || null,
      password_hash: user.password_hash || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('users')
      .upsert(payload, { onConflict: 'email' })
      .select('*')
      .single();

    if (error) {
      console.warn('[SupabaseDb] upsertUserInDb error:', error.message);
      return null;
    }
    return data as DbUserRecord;
  } catch (err: any) {
    console.warn('[SupabaseDb] upsertUserInDb exception:', err.message);
    return null;
  }
}

/**
 * 3. Get all registered users from Supabase for Admin view
 */
export async function getAllUsersFromDb(): Promise<DbUserRecord[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  try {
    const { data, error } = await admin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SupabaseDb] getAllUsersFromDb error:', error.message);
      return [];
    }
    return (data as DbUserRecord[]) || [];
  } catch (err: any) {
    console.warn('[SupabaseDb] getAllUsersFromDb exception:', err.message);
    return [];
  }
}

/**
 * 4. Save project to Supabase
 */
export async function saveProjectInDb(project: DbProjectRecord): Promise<DbProjectRecord | null> {
  const admin = getSupabaseAdmin();
  if (!admin || !project.id) return null;

  try {
    const payload = {
      id: project.id,
      user_id: project.user_id || 'anonymous',
      user_email: project.user_email || null,
      name: project.name || 'Untitled Project',
      data: project.data,
      thumbnail: project.thumbnail || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('projects')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.warn('[SupabaseDb] saveProjectInDb error:', error.message);
      return null;
    }
    return data as DbProjectRecord;
  } catch (err: any) {
    console.warn('[SupabaseDb] saveProjectInDb exception:', err.message);
    return null;
  }
}

/**
 * 5. Get user projects from Supabase
 */
export async function getUserProjectsFromDb(userId: string, userEmail?: string): Promise<DbProjectRecord[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  try {
    let query = admin.from('projects').select('*');

    if (userId && userEmail) {
      query = query.or(`user_id.eq.${userId},user_email.ilike.${userEmail}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (userEmail) {
      query = query.ilike('user_email', userEmail);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) {
      console.warn('[SupabaseDb] getUserProjectsFromDb error:', error.message);
      return [];
    }
    return (data as DbProjectRecord[]) || [];
  } catch (err: any) {
    console.warn('[SupabaseDb] getUserProjectsFromDb exception:', err.message);
    return [];
  }
}

/**
 * 6. Delete project in Supabase
 */
export async function deleteProjectInDb(projectId: string, userId?: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin || !projectId) return false;

  try {
    let query = admin.from('projects').delete().eq('id', projectId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      console.warn('[SupabaseDb] deleteProjectInDb error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SupabaseDb] deleteProjectInDb exception:', err.message);
    return false;
  }
}

/**
 * 7. Save transaction in Supabase
 */
export async function saveTransactionInDb(tx: PaymentTransactionRecord): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin || !tx.orderId) return;

  try {
    const payload = {
      id: tx.id || `tx_${Date.now()}`,
      order_id: tx.orderId,
      payment_id: tx.paymentId || null,
      user_id: tx.userId || null,
      customer_name: tx.customerName || null,
      customer_email: tx.customerEmail || null,
      plan_id: tx.planId || null,
      plan_name: tx.planName || null,
      amount: tx.amount,
      gateway: tx.gateway || 'cashfree',
      status: tx.status || 'PENDING',
      payment_method: tx.paymentMethod || null,
      created_at: tx.createdAt || new Date().toISOString(),
      expires_at: tx.expiresAt || null,
      raw_event: tx.rawEvent || null,
    };

    const { error } = await admin
      .from('payment_transactions')
      .upsert(payload, { onConflict: 'order_id' });

    if (error) {
      console.warn('[SupabaseDb] saveTransactionInDb error:', error.message);
    }
  } catch (err: any) {
    console.warn('[SupabaseDb] saveTransactionInDb exception:', err.message);
  }
}

/**
 * 8. Get all transactions from Supabase
 */
export async function getAllTransactionsFromDb(): Promise<PaymentTransactionRecord[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  try {
    const { data, error } = await admin
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SupabaseDb] getAllTransactionsFromDb error:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      orderId: row.order_id,
      paymentId: row.payment_id,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      planId: row.plan_id,
      planName: row.plan_name,
      amount: Number(row.amount),
      gateway: row.gateway || 'cashfree',
      status: row.status,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      rawEvent: row.raw_event,
    }));
  } catch (err: any) {
    console.warn('[SupabaseDb] getAllTransactionsFromDb exception:', err.message);
    return [];
  }
}

/**
 * 9. Get all active templates from Supabase
 */
export async function getAllTemplatesFromDb(): Promise<DbTemplateRecord[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  try {
    const { data, error } = await admin
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[SupabaseDb] getAllTemplatesFromDb error:', error.message);
      return [];
    }
    return (data || []) as DbTemplateRecord[];
  } catch (err: any) {
    console.warn('[SupabaseDb] getAllTemplatesFromDb exception:', err.message);
    return [];
  }
}

/**
 * 10. Get a single template by ID
 */
export async function getTemplateByIdFromDb(templateId: string): Promise<DbTemplateRecord | null> {
  const admin = getSupabaseAdmin();
  if (!admin || !templateId) return null;

  try {
    const { data, error } = await admin
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .maybeSingle();

    if (error) {
      console.warn('[SupabaseDb] getTemplateByIdFromDb error:', error.message);
      return null;
    }
    return data as DbTemplateRecord | null;
  } catch (err: any) {
    console.warn('[SupabaseDb] getTemplateByIdFromDb exception:', err.message);
    return null;
  }
}

/**
 * 11. Upsert a template design in Supabase
 */
export async function saveTemplateInDb(template: {
  id: string;
  name: string;
  category?: string;
  description?: string;
  floors?: number;
  area?: string;
  badge?: string;
  thumbnail?: string;
  data: any;
  is_active?: boolean;
}): Promise<DbTemplateRecord | null> {
  const admin = getSupabaseAdmin();
  if (!admin || !template.id) return null;

  try {
    const payload = {
      id: template.id,
      name: template.name,
      category: template.category || 'Apartment',
      description: template.description || '',
      floors: template.floors || (template.data?.floors?.length || 1),
      area: template.area || 'Spacious Suite',
      badge: template.badge || null,
      thumbnail: template.thumbnail || null,
      data: template.data,
      is_active: template.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('templates')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[SupabaseDb] saveTemplateInDb error:', error.message);
      return null;
    }
    return data as DbTemplateRecord | null;
  } catch (err: any) {
    console.warn('[SupabaseDb] saveTemplateInDb exception:', err.message);
    return null;
  }
}

/**
 * 12. Delete a template from Supabase
 */
export async function deleteTemplateInDb(templateId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin || !templateId) return false;

  try {
    const { error } = await admin.from('templates').delete().eq('id', templateId);
    if (error) {
      console.warn('[SupabaseDb] deleteTemplateInDb error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SupabaseDb] deleteTemplateInDb exception:', err.message);
    return false;
  }
}

/**
 * 13. Get app configuration from Supabase (e.g. key = 'payment_config')
 */
export async function getAppConfigFromDb<T = any>(key: string): Promise<T | null> {
  const admin = getSupabaseAdmin();
  if (!admin || !key) return null;

  try {
    const { data, error } = await admin
      .from('app_config')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[SupabaseDb] getAppConfigFromDb(${key}) error:`, error.message);
      return null;
    }
    return data ? (data.value as T) : null;
  } catch (err: any) {
    console.warn(`[SupabaseDb] getAppConfigFromDb(${key}) exception:`, err.message);
    return null;
  }
}

/**
 * 14. Save app configuration to Supabase
 */
export async function saveAppConfigInDb(key: string, value: any): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin || !key) return false;

  try {
    const { error } = await admin
      .from('app_config')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn(`[SupabaseDb] saveAppConfigInDb(${key}) error:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[SupabaseDb] saveAppConfigInDb(${key}) exception:`, err.message);
    return false;
  }
}


