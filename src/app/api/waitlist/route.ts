import { createClient } from "@/lib/supabase/server";
import { NextResponse } from 'next/server';
import { globalRateLimit, getIp } from "@/lib/ratelimit";
import { z } from "zod";
import { formatZodError } from "@/lib/validations";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email format"),
});

/**
 * API route for Pro Plan waitlist signups.
 * Integrates with Supabase 'waitlist' table.
 */
export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const { success } = await globalRateLimit.limit(ip);
    if (!success) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }

    const body = await request.json();
    const validation = waitlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 });
    }
    
    const { email } = validation.data;

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
