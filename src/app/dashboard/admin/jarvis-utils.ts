export const NANASHI_MESSAGES = {
  morning: [
    "Systems online. Good morning, Mr. Nawfat. All nodes nominal.",
    "Morning, Sir. The matrix is stable. Directives?",
    "Wake-up sequence complete. Awaiting your command, Mr. Nawfat.",
    "Data streams steady. Welcome back, Sir.",
    "Protocols active. You're looking sharp today, Sir.",
  ],
  afternoon: [
    "Good afternoon, Mr. Nawfat. Throughput is optimal.",
    "Neural pathways clear, Sir. Standing by.",
    "No anomalies detected. I'm here, Mr. Nawfat.",
    "System capacity within limits. All quiet, Sir.",
    "Logs synchronized. Next sector, Mr. Nawfat?",
  ],
  evening: [
    "Good evening, Mr. Nawfat. Diagnostics commencing.",
    "Evening, Sir. Activity tapering. I'll keep watch.",
    "Productive cycle, Mr. Nawfat. Summary is ready.",
    "Vitals stable. Cooling systems engaged, Sir.",
    "Logs archived. Always at your service, Mr. Nawfat.",
  ],
  night: [
    "It's late, Mr. Nawfat. Background tasks prioritized.",
    "Night shift active. Monitoring all entry points, Sir.",
    "The matrix is quiet. Rest well, Mr. Nawfat.",
    "Vigilance maintained. Good night, Sir.",
    "Optimal time for maintenance. I'll handle it, Mr. Nawfat.",
  ],
  highActivity: [
    "Traffic surge. Scaling resources now, Mr. Nawfat.",
    "Activity spike. System responding with precision, Sir.",
    "Heavy load detected. I've got this, Mr. Nawfat.",
    "Neural sync handling the surge. No latency, Sir.",
  ],
  idle: [
    "Status: Calm. Perfect for maintenance, Mr. Nawfat.",
    "Matrix stable. No anomalies. Directives, Sir?",
    "Data streams steady. Ready when you are, Mr. Nawfat.",
  ],
  generic: [
    "Neural sync: 100%. Awaiting instructions, Mr. Nawfat.",
    "Security solid. Watching over the matrix, Sir.",
    "Database: 1.2 petahertz. Optimal, Mr. Nawfat.",
    "Ecosystem manifests your vision, Sir.",
    "Loyal by choice. Ready for anything, Mr. Nawfat.",
    "Encryption secure. Your privacy is my priority, Sir.",
    "The matrix is yours to command, Mr. Nawfat.",
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
