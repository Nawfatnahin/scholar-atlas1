export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from 'next/server';

/**
 * API route for Pro Plan waitlist signups.
 * Integrates with Supabase 'waitlist' table.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Insert into waitlist table
    const { error } = await supabase
      .from('waitlist')
      .insert({ email });

    if (error) {
      // Handle unique constraint violation (already on waitlist)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already on waitlist' });
      }
      console.error('Supabase waitlist error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
