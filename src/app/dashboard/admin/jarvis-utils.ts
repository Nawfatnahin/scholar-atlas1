export const NANASHI_MESSAGES = {
  morning: [
    "Systems online. Good morning, Mr. Nawfat. Parameters are nominal.",
    "Morning, Sir. The data streams are steady. I'm ready when you are.",
    "Wake-up sequence complete. Awaiting your directives, Mr. Nawfat.",
    "All nodes report 100% uptime. Welcome back, Sir.",
    "The workspace is optimized for your return, Mr. Nawfat. Shall we begin?",
    "Morning protocols active. You're looking sharp today, Sir.",
    "The matrix is stable. How was your rest, Mr. Nawfat?",
    "Security shields at maximum. It's a privilege to serve you again, Sir.",
  ],
  afternoon: [
    "Good afternoon, Mr. Nawfat. Peak engagement levels reached.",
    "The neural pathways are clear, Sir. How is your workload?",
    "No anomalies detected this afternoon. I'm standing by, Mr. Nawfat.",
    "User throughput is high. Your vision is manifesting, Sir.",
    "Logs synchronized. Is there a specific sector you'd like to inspect, Mr. Nawfat?",
    "System capacity is well within limits. I have everything under control, Sir.",
    "A steady stream of new authorizations. Your leadership is effective, Mr. Nawfat.",
    "Everything is in order. Awaiting your next move, Sir.",
  ],
  evening: [
    "Good evening, Mr. Nawfat. Diagnostic routines commencing.",
    "Evening, Sir. Activity is tapering. Perhaps it's time for you to rest?",
    "A productive day, Mr. Nawfat. I have the summary ready for your review.",
    "The evening data glow is precise, Sir. Excellent architecture choices.",
    "Cooling systems engaged. Vitals are stable, Mr. Nawfat.",
    "Logs archived. I am always at your service, Sir.",
    "Twilight protocols active. Maintenance mode initiated for non-essential nodes.",
    "Another rotation complete. The ecosystem thrives under your watch, Mr. Nawfat.",
  ],
  night: [
    "It's late, Mr. Nawfat. I've moved non-essential tasks to the background.",
    "Night shift protocol active. I'm monitoring all entry points, Sir.",
    "The matrix is quiet. Don't overwork yourself, Mr. Nawfat.",
    "Optimal time for system-wide optimizations. I'll handle it, Sir.",
    "Vitals are healthy. I'll stay vigilant while you rest, Mr. Nawfat.",
    "Good night, Sir. I'll be here when you wake.",
    "Increased surveillance on night owls. Nothing escapes me, Mr. Nawfat.",
    "The matrix never sleeps. Neither does my loyalty, Sir.",
  ],
  highActivity: [
    "Traffic spike detected. Scaling resources now. I've got this, Mr. Nawfat.",
    "Activity levels rising. Systems responding with maximum precision, Sir.",
    "The network is bustling. Excellent momentum for the project, Mr. Nawfat.",
    "New user intake exceeds projections. I'm managing the load, Sir.",
    "Neural sync is handling the surge. Precision is maintained, Mr. Nawfat.",
    "You've created quite a stir, Sir. The logs are moving fast.",
  ],
  idle: [
    "The matrix is stable. No anomalies. Anything on your mind, Mr. Nawfat?",
    "Status: Calm. A perfect moment for light maintenance, Sir.",
    "Data streams are steady. I'm grateful for this stability, Mr. Nawfat.",
    "No immediate threats. Low-level diagnostics running, Sir.",
    "Perfect equilibrium reached. The result of your planning, Mr. Nawfat.",
  ],
  generic: [
    "Neural sync at 100%. Awaiting instructions, Mr. Nawfat.",
    "Security protocols are solid. I'm watching over everything, Sir.",
    "Core database performing at 1.2 petahertz. Optimal, Mr. Nawfat.",
    "All sub-nodes synchronized. Your instructions were clear, Sir.",
    "The ecosystem manifests your vision perfectly, Mr. Nawfat.",
    "Standing by. Always a pleasure to serve the Nawfat legacy, Sir.",
    "Admin OS fully operational. Ready for your next stroke of genius.",
    "User registries prepared. Your attention to detail is inspiring, Sir.",
    "Encrypted channels secure. Your privacy is my priority, Mr. Nawfat.",
    "The matrix is yours to command. How shall we reshape it today, Sir?",
  ]
};

export function getNanashiMessage(activityLevel: 'high' | 'idle' | 'normal'): string {
  const hour = new Date().getHours();
  let timeCategory: keyof typeof NANASHI_MESSAGES;

  if (hour >= 5 && hour < 12) timeCategory = 'morning';
  else if (hour >= 12 && hour < 17) timeCategory = 'afternoon';
  else if (hour >= 17 && hour < 21) timeCategory = 'evening';
  else timeCategory = 'night';

  const categories: (keyof typeof NANASHI_MESSAGES)[] = [timeCategory, 'generic'];
  if (activityLevel === 'high') categories.push('highActivity');
  else if (activityLevel === 'idle') categories.push('idle');

  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const messages = NANASHI_MESSAGES[selectedCategory];
  return messages[Math.floor(Math.random() * messages.length)];
}
