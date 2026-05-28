export const revalidate = 0;
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { globalRateLimit, getIp } from '@/lib/ratelimit';

export async function GET(req: Request) {
  const ip = getIp(req);
  const { success } = await globalRateLimit.limit(ip);
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }

  const supabase = await createClient();
  
  // Try to delete a non-existent email to see the error, or just try deleting an existing one to capture the exact error message.
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('email', 'test_delete_error@example.com');

  return NextResponse.json({ error });
}
