"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    checkUser();
  }, []);

  return (
    <footer className="pt-12 pb-8 border-t border-border-strong">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 mb-10">
            <div>
              <Link href="/" className="font-display text-[20px] font-bold text-ink flex items-center gap-2 no-underline tracking-tight mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#92400e]/85 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                    <path d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7l-7-5z" />
                  </svg>
                </div>
                BackLogger Buddy
              </Link>
              <p className="text-[13px] text-ink-3 leading-[1.6] max-w-[280px]">
                The academic command center for university students. Fast, focused and free to start.
              </p>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-ink-3 mb-3.5">Product</h4>
              <div className="flex flex-col gap-2">
                <Link href={user ? "/tools/pdf" : "/signup"} className="text-[14px] text-ink-2 hover:text-ink transition-colors">PDF Tools</Link>
                <Link href={user ? "/dashboard/attendance" : "/signup"} className="text-[14px] text-ink-2 hover:text-ink transition-colors">Attendance</Link>
                <Link href={user ? "/dashboard/tasks" : "/signup"} className="text-[14px] text-ink-2 hover:text-ink transition-colors">Task Tracker</Link>
                <Link href={user ? "/dashboard/cgpa" : "/signup"} className="text-[14px] text-ink-2 hover:text-ink transition-colors">CGPA Manager</Link>
                <Link href="/#pricing" className="text-[14px] text-ink-2 hover:text-ink transition-colors">Pricing</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-border-strong text-[13px] text-ink-3 gap-3">
            <span>© 2026 BackLogger Buddy. All rights reserved.</span>
          </div>
        </div>
      </footer>
  );
}
