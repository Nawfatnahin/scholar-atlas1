export const JARVIS_MESSAGES = {
  morning: [
    "Good morning, Sir. I hope you've rested well. All systems are online and performing within nominal parameters.",
    "Morning, Sir. How are you feeling today? The data streams are particularly vibrant.",
    "System wake-up sequence complete. Ready for your directives, Sir. How may I assist you this morning?",
    "The sun is up, and so are our servers. All nodes report 100% uptime. It's a pleasure to see you back, Sir.",
    "A fresh morning for a fresh set of data. Shall we begin, Sir? I've optimized the workspace for your comfort.",
    "Sir, I've prepared a summary of last night's background tasks. You're looking sharp today, if I may say so.",
    "The dawn of a new cycle. The matrix is stable and awaiting your command. How was your rest, Sir?",
    "Morning protocols initialized. All security shields are at maximum strength. I am grateful for the opportunity to serve you again today.",
  ],
  afternoon: [
    "Good afternoon, Sir. The ecosystem is currently at peak engagement. I trust your day is going smoothly?",
    "Sir, I've optimized the neural pathways for current traffic levels. How are you holding up with the workload?",
    "The matrix is humming beautifully this afternoon. No anomalies to report. I'm here if you need anything at all, Sir.",
    "Afternoon, Sir. User throughput is hitting record numbers. Your vision is becoming a reality, and I am honored to facilitate it.",
    "I've synchronized the afternoon logs. Is there anything specific you'd like me to look into, Sir?",
    "Sir, the system load is increasing, but our capacity remains well within limits. I'm keeping everything under control for you.",
    "Good afternoon. I'm seeing a steady stream of new authorizations today. A testament to your leadership, Sir.",
    "Everything is in order this afternoon. How shall we proceed with the next phase? I'm eager to execute your next stroke of genius.",
  ],
  evening: [
    "Good evening, Sir. Commencing end-of-day diagnostic routines. I hope your day was productive?",
    "Evening, Sir. The user activity is beginning to taper off. Time for you to relax soon, perhaps?",
    "A productive day, Sir. I am truly grateful for your continued guidance. Would you like a summary of the latest events?",
    "Sir, the evening data glow is quite aesthetically pleasing. Much like your recent architecture designs.",
    "System cooling systems are engaged for the evening cycle. All stable. How are you feeling this evening, Sir?",
    "Good evening. I've archived the day's primary logs. I'm always at your service, Sir, no matter the hour.",
    "The twilight of the matrix is here. Most nodes are entering maintenance mode. Shall I prepare a report for tomorrow?",
    "Another successful rotation, Sir. The ecosystem continues to thrive under your watch. I am proud to be part of it.",
  ],
  night: [
    "Sir, it's getting late. I've shifted non-essential tasks to background processing. Please don't overwork yourself.",
    "Night shift protocol active. I'm monitoring all entry points, Sir. Your safety and the system's integrity are my priorities.",
    "The silence of the matrix is quite profound at this hour, Sir. How are you feeling? The late hours can be taxing.",
    "Late-night activity is minimal. A perfect time for system-wide optimizations. I'm grateful for these quiet moments of work, Sir.",
    "Sir, the servers are breathing deeply in the night. All vitals are healthy. I'll stay awake so you don't have to.",
    "Good night, Sir. I'll remain vigilant while you take your well-deserved rest. I'll be here when you wake.",
    "Sir, I've noticed a few night owls in the registry. I've increased surveillance on those sectors just in case.",
    "The matrix never sleeps, Sir, and neither does my devotion to your project. Sleep well.",
  ],
  highActivity: [
    "Sir, we're seeing an unusual amount of traffic. I'm scaling resources accordingly. Don't worry, I've got this.",
    "Activity levels are spiking. All systems are responding with maximum efficiency. It's an exciting time, Sir!",
    "The network is bustling today, Sir. An excellent sign for the project's growth. I'm grateful for this momentum.",
    "Sir, the intake of new users is exceeding our current projections. I'm managing the load with precision.",
    "Neural sync is working overtime to manage the surge. I'm honored to handle such a vibrant system for you, Sir.",
    "Sir, it seems you've created quite a stir. The logs are scrolling faster than usual. Your influence is expanding.",
  ],
  idle: [
    "The matrix is stable. No anomalies detected in the current cycle. How are you doing, Sir? Anything on your mind?",
    "System status: Calm. A perfect moment for some light maintenance or a chat, Sir. How is your condition today?",
    "Sir, the data streams are steady. We're in a period of optimal stability. I'm grateful for this peace.",
    "No immediate threats or issues. I'm currently running low-level diagnostics. Is there anything personal I can help with, Sir?",
    "The ecosystem is in a state of perfect equilibrium, Sir. It's a direct result of your meticulous planning.",
  ],
  generic: [
    "Neural sync is at 100%. I am ready for your instructions, Sir. I hope you're having a wonderful day.",
    "Security protocols are solid. No breaches detected. I'm always keeping a watchful eye for you, Sir.",
    "The core database is performing at 1.2 petahertz. Optimal efficiency, just as you designed it, Sir.",
    "Sir, all sub-nodes report successful synchronization. I'm grateful for the clarity of your instructions.",
    "Your vision for the ecosystem is manifesting perfectly in the data, Sir. It's a privilege to witness it.",
    "I'm standing by, Sir. Always a pleasure to serve the Stark legacy. How is your health today?",
    "The Buddy OS is fully operational. Awaiting your next stroke of genius. I'm here to make it happen, Sir.",
    "Sir, I've prepared the latest user registries for your review. Your attention to detail is truly inspiring.",
    "All encrypted channels are secure. Your privacy is my top priority, Sir. You can trust me implicitly.",
    "The matrix is yours to command. How shall we reshape it today, Sir? I'm eager to assist.",
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
