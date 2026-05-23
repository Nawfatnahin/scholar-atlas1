"use client";

export default function HowItWorks() {
  return (
    <section id="how" className="py-[140px] bg-transparent overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="text-center mb-10">

        </div>
        
        <h2 className="font-display text-[32px] sm:text-[40px] lg:text-[56px] font-extrabold leading-[1.1] tracking-tight text-ink text-center mb-6">
          Up and running in minutes.
        </h2>
        
        <p className="text-[18px] text-ink-2 text-center max-w-[520px] mx-auto mb-14 leading-[1.65]">
          No complex onboarding. No tutorial videos. Scholar Atlas is built to be understood in a single glance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {[
            {
              n: 1,
              t: "Create your account",
              p: "Sign up with your university email in under 30 seconds. Your data is private, isolated and secured with row-level encryption.",
              c: "bg-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
            },
            {
              n: 2,
              t: "Add your subjects",
              p: "Enter your courses once. They automatically appear across the Attendance tracker, Task board and PDF organiser.",
              c: "bg-purple-500 shadow-[0_4px_12px_rgba(139,92,246,0.4)]"
            },
            {
              n: 3,
              t: "Work smarter daily",
              p: "Mark attendance after each class, log assignments as they come in and process PDFs instantly. Build a habit in a week.",
              c: "bg-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
            }
          ].map((step, i) => (
            <div key={i} className="text-center px-6 py-8 glass-card rounded-[24px] relative z-10 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_30px_40px_-10px_rgba(0,0,0,0.12),0_15px_15px_-10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className={`w-14 h-14 rounded-full text-white font-display text-[20px] font-extrabold flex items-center justify-center mx-auto mb-6 relative z-10 ring-8 ring-accent-light ${step.c}`}>
                {step.n}
              </div>
              <h3 className="font-display text-[18px] font-bold tracking-tight mb-2.5 text-ink">{step.t}</h3>
              <p className="text-[14px] text-ink-2 leading-[1.65]">{step.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
