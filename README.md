# Scholar Atlas


Scholar Atlas is a comprehensive student dashboard and academic planner built for peak productivity. It seamlessly integrates attendance tracking, multi-semester CGPA forecasting, task management, and client-side PDF tools into a single, beautifully designed application.
You can check the live website at : https://scholar-atlas.scholar-atlas.workers.dev/

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

- **Node.js v22 or higher** (Required for Wrangler v4 and Cloudflare deployment)
- A **Supabase account** and project for database and authentication

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
   Copy the provided `.env.example` file to create your local environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## ☁️ Deployment

Scholar Atlas is architected for Edge deployment on Cloudflare Workers utilizing OpenNext.

To deploy to Cloudflare Workers:
1. Ensure you have authenticated with Cloudflare via Wrangler:
   ```bash
   npx wrangler login
   ```
2. Run the deployment script:
   ```bash
   npm run deploy
   ```
*Note: This command runs the OpenNext build and Wrangler deployment. If you encounter build cache collisions, delete the `.open-next/` directory before retrying.*

### CI/CD
Continuous integration is handled via GitHub Actions (`.github/workflows/deploy.yml`). Pushes to the `main` branch will automatically trigger the build and deployment process provided that `CLOUDFLARE_API_TOKEN` is configured in your repository secrets.

## 🛡️ Architecture & Security

- **Database RLS:** All database access is gated through strict Row-Level Security policies. Indexes are explicitly applied to policy filter columns to prevent sequential scans.
- **Database Migrations:** Schema changes and setup scripts are organized in the `/supabase/migrations/` directory using timestamp-based versions for reliability.
- **Crawler Optimization:** `robots.ts` is configured to allow indexing by major search and AI engines (like Googlebot and ClaudeBot) while actively blocking raw training collectors (like CCBot and Bytespider) from leeching bandwidth.

## About Scholar Atlas

Scholar Atlas is a production-grade academic management platform built to handle the complexity of multi-semester GPA tracking, attendance management, and task organization. Designed with real student workflow in mind.

### Why I Built This
Existing solutions like generic task managers or rigid university portals fail to handle complex multi-semester forecasting and dynamic attendance weighting gracefully. Scholar Atlas solves this fragmentation.

### Key Achievements
- Deployed on Cloudflare Workers (edge optimization)
- Strict Supabase RLS policies (security-first architecture)
- Real-time syncing with Zustand + React Query
- Processed thousands of academic records with zero data loss
