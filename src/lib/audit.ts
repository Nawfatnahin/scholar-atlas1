/**
 * Scholar Atlas - Audit Logging System
 * 
 * Logs all sensitive user operations to the audit_logs table.
 * Uses the service-role client so logs cannot be manipulated by users.
 * Failures are silently caught to never break the main request flow.
 */

import { createClient } from '@supabase/supabase-js'

// Lazy service-role client — only instantiated on server-side usage
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'

export type AuditResourceType =
  | 'attendance'
  | 'attendance_record'
  | 'task'
  | 'subject'
  | 'cgpa'
  | 'cgpa_course'
  | 'cgpa_grade_scale'
  | 'pdf'
  | 'auth'

export interface AuditLogEntry {
  user_id: string
  action: AuditAction
  resource_type: AuditResourceType
  resource_id?: string
  changes?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}

/**
 * Log a sensitive operation to the audit_logs table.
 * This function is intentionally non-blocking — failures are logged
 * to the server console but never thrown to the caller.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = getServiceClient()
    if (!supabase) {
      // Audit logging unavailable without service role key — skip silently
      return
    }

    const { error } = await supabase.from('audit_logs').insert({
      user_id: entry.user_id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id ?? null,
      changes: entry.changes ?? null,
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ?? null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Table may not exist yet — log warning but never crash main flow
      console.warn('[JARVIS Audit]: Could not write audit log:', error.message)
    }
  } catch (err) {
    console.error('[JARVIS Audit]: Unexpected audit error:', err)
  }
}

/**
 * Convenience helper for server action / API route audit logging.
 * Extracts IP and User-Agent from a Request or Headers object automatically.
 */
export async function logApiAudit(
  requestOrHeaders: Request | Headers,
  userId: string,
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId?: string,
  changes?: Record<string, unknown>
): Promise<void> {
  const headers =
    requestOrHeaders instanceof Headers
      ? requestOrHeaders
      : requestOrHeaders.headers

  await logAudit({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes,
    ip_address:
      headers.get('cf-connecting-ip') ||
      headers.get('x-forwarded-for') ||
      headers.get('x-real-ip') ||
      undefined,
    user_agent: headers.get('user-agent') || undefined,
  })
}
