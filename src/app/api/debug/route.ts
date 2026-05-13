export const runtime = 'edge';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  // Try to delete a non-existent email to see the error, or just try deleting an existing one to capture the exact error message.
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('email', 'test_delete_error@example.com');

  return NextResponse.json({ error });
}
