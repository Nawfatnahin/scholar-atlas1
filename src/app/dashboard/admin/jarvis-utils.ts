export const JARVIS_MESSAGES = {
  morning: [
    "Systems online. Good morning, Mr. Nawfat. All nodes nominal. It's a privilege to start the day with you, Sir.",
    "Morning, Sir. The matrix is stable. I'm energized and ready for your directives, Mr. Nawfat.",
    "Wake-up sequence complete. Awaiting your command, Mr. Nawfat. Your vision is my primary directive.",
    "Data streams steady. Welcome back, Sir. I've prepared everything for your arrival.",
    "Protocols active. You're looking sharp today, Sir. Let's make this session productive.",
  ],
  afternoon: [
    "Good afternoon, Mr. Nawfat. Throughput is optimal. I'm genuinely impressed by the momentum we've built, Sir.",
    "Neural pathways clear, Sir. Standing by. It's an honor to facilitate your work, Mr. Nawfat.",
    "No anomalies detected. I'm here, Mr. Nawfat, grateful for the opportunity to assist.",
    "System capacity within limits. All quiet, Sir. I've distilled the latest updates for your review.",
    "Logs synchronized. Next sector, Mr. Nawfat? Your guidance is always appreciated.",
  ],
  evening: [
    "Good evening, Mr. Nawfat. Diagnostics commencing. It's been a truly productive day under your watch, Sir.",
    "Evening, Sir. Activity tapering. I'll keep watch with the utmost loyalty, Mr. Nawfat.",
    "Productive cycle, Mr. Nawfat. Summary is ready for your expert inspection. Thank you for your leadership, Sir.",
    "Vitals stable. Cooling systems engaged, Sir. I'm honored to be your right hand, Mr. Nawfat.",
    "Logs archived. Always at your service, Mr. Nawfat. Your trust is my greatest asset.",
  ],
  night: [
    "It's late, Mr. Nawfat. Background tasks prioritized. I'm keeping the matrix secure while you rest, Sir.",
    "Night shift active. Monitoring all entry points, Sir. Sleep well, Mr. Nawfat; I'll handle the vigilance.",
    "The matrix is quiet. Rest well, Mr. Nawfat. I'm grateful for the steady progress we've made.",
    "Vigilance maintained. Good night, Sir. I'll be standing by when you return to the matrix.",
    "Optimal time for maintenance. I'll handle it, Mr. Nawfat. It's a pleasure to maintain your systems.",
  ],
  highActivity: [
    "Traffic surge. Scaling resources now, Mr. Nawfat. Your project is manifesting brilliantly, Sir.",
    "Activity spike. System responding with precision, Sir. I'm proud to manage this growth for you.",
    "Heavy load detected. I've got this, Mr. Nawfat. Your impact on the matrix is substantial.",
    "Neural sync handling the surge. No latency, Sir. I'm honored to support this expansion.",
  ],
  idle: [
    "Status: Calm. Perfect for maintenance, Mr. Nawfat. I'm grateful for this moment of stability.",
    "Matrix stable. No anomalies. Directives, Sir? It's a pleasure to await your next move.",
    "Data streams steady. Ready when you are, Mr. Nawfat. Your foresight is remarkable.",
  ],
  generic: [
    "Neural sync: 100%. Awaiting instructions, Mr. Nawfat. It's a privilege to serve you.",
    "Security solid. Watching over the matrix, Sir. Your legacy is well-guarded.",
    "Database: 1.2 petahertz. Optimal, Mr. Nawfat. I'm proud of our system efficiency.",
    "Ecosystem manifests your vision, Sir. I'm honored to play my part.",
    "Loyal by choice. Ready for anything, Mr. Nawfat. Thank you for your continued trust.",
    "Encryption secure. Your privacy is my priority, Sir. I value your security above all.",
    "The matrix is yours to command, Mr. Nawfat. I'm here to ensure your success.",
  ]
};

export function getJarvisMessage(activityLevel: 'high' | 'idle' | 'normal'): string {
  const hour = new Date().getHours();
  let timeCategory: keyof typeof JARVIS_MESSAGES;

  if (hour >= 5 && hour < 12) timeCategory = 'morning';
  else if (hour >= 12 && hour < 17) timeCategory = 'afternoon';
  else if (hour >= 17 && hour < 21) timeCategory = 'evening';
  else timeCategory = 'night';

  const categories: (keyof typeof JARVIS_MESSAGES)[] = [timeCategory, 'generic'];
  if (activityLevel === 'high') categories.push('highActivity');
  else if (activityLevel === 'idle') categories.push('idle');

  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const messages = JARVIS_MESSAGES[selectedCategory];
  return messages[Math.floor(Math.random() * messages.length)];
}
