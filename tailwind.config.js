/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg-base)',
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        // Preserve existing named colors for compatibility
        "bg-old": "#F2EFE6",
        "bg-warm": "#fdf8f0",
        "bg-sidebar": "#fffdf8",
        ink: "#0D0D0D",
        "ink-2": "#3D3D3D",
        "ink-3": "#7A7A7A",
        "ink-4": "#B0B0B0",
        accent: "#92400e",
        "accent-orange": "#f97316",
        "accent-amber": "#f59e0b",
        "accent-light": "#F5EFEB",
        "border-strong": "rgba(0, 0, 0, 0.08)",
        // Adding Jarvis colors as separate namespace
        jarvis: {
          bg: "#000000",
          "bg-warm": "#030303",
          "bg-sidebar": "#050505",
          ink: "#FFFFFF",
          "ink-2": "#94A3B8",
          "ink-3": "#64748B",
          "ink-4": "#475569",
          accent: "#06B6D4",
          "accent-blue": "#3B82F6",
          "accent-cyan": "#06B6D4",
          "accent-light": "rgba(6, 182, 212, 0.15)",
          "border-strong": "rgba(6, 182, 212, 0.2)",
          blue: "#0ea5e9",
        }
      },
      fontFamily: {
        display: ["var(--font-lora)", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      animation: {
        float: "floatY 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
