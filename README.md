# Scholar Atlas
-A open source website . 
Scholar Atlas is a comprehensive student dashboard and academic planner built for peak productivity. It seamlessly integrates attendance tracking, multi-semester CGPA forecasting, task management, and client-side PDF tools into a single, beautifully designed application.

## ✨ Features

- **Attendance Tracker:** Subject-wise class logging, percentage calculations, threshold warnings, and a dedicated engine for tracking extra classes.
- **Multi-Semester CGPA Manager:** Dual-engine calculator with target grade forecasting, multi-semester layouts, and degree progress widgets.
- **Task Management:** Kanban board with subject tagging and due dates to keep assignments and study sessions organized.
- **Client-Side PDF Tools:** Fast and private PDF merging, splitting, and conversion processed entirely within your browser.
- **Dynamic Theming:** Comprehensive Light and Dark mode system featuring CSS variable-based theming and elegant glassmorphism UI elements.
- **Secure & Edge-Ready:** Powered by Supabase Auth and strict PostgreSQL Row-Level Security (RLS) policies, optimized for edge deployment.

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js 15 (App Router) with React 18
- **Styling & UI:** Tailwind CSS, Framer Motion, Radix UI (via shadcn/ui patterns)
- **State Management:** Zustand, React Query
- **Database & Authentication:** Supabase (PostgreSQL)
- **Deployment Engine:** Cloudflare Workers (via OpenNext)

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js v22 or higher** installed to meet the Wrangler v4 requirements for Cloudflare deployment.

### Installation

1. **Clone the project and navigate to the directory:**
   ```bash
   git clone <repository-url>
   cd scholar-atlas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and configure your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Check the existing `.env.production` or `.dev.vars` for any additional environment requirements.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to experience the dashboard.

## ☁️ Deployment

Scholar Atlas is architected for Edge deployment on Cloudflare Workers utilizing OpenNext.

To deploy manually:
```bash
npm run deploy
```
*Note: This command runs the OpenNext build and Wrangler deployment. If you encounter build cache collisions, delete the `.open-next/` directory before retrying.*

### CI/CD
Continuous integration is handled via GitHub Actions (`.github/workflows/deploy.yml`). Pushes to the `main` branch will automatically trigger the build and deployment process provided that `CLOUDFLARE_API_TOKEN` is configured in your repository secrets.

## 🛡️ Architecture & Security

- **Database RLS:** All database access is gated through strict Row-Level Security policies. Indexes are explicitly applied to policy filter columns to prevent sequential scans.
- **Crawler Optimization:** `robots.ts` is configured to allow indexing by major search and AI engines (like Googlebot and ClaudeBot) while actively blocking raw training collectors (like CCBot and Bytespider) from leeching bandwidth.


## About me 
- It is my first project of making a dedicated working website that is helpful for me and all the others who will use this website . I created it for my personal use and I used AI to build this whole website . It is a result of my curiosity in Vibecoding. 
Currently , I'm studing BURP in RUET, Bangladesh. (2026) 
Hoping that I will improve the website further in the future .
