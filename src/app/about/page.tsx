import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-base font-body flex flex-col text-text-primary selection:bg-indigo-500/10 selection:text-indigo-500">
      <Navigation />
      
      <main className="flex-1 w-full">
        {/* SECTION 1 — Hero */}
        <section className="bg-bg-base pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-sm font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
                Our Story
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                Built for students,<br />
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  by a student.
                </span>
              </h1>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                Scholar Atlas started as a frustration with fragmented tools &mdash;
                separate apps for attendance, tasks, grades, and documents.
                This platform brings all of it into one focused, distraction-free space
                built specifically for the university student.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Mission Statement */}
        <section className="bg-bg-base py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <blockquote className="border-l-4 border-indigo-500 pl-6 md:pl-10">
              <p className="text-xl md:text-2xl font-medium italic text-gray-700 dark:text-gray-200">
                &ldquo;Scholar Atlas exists because academic life shouldn&apos;t be harder than the academics themselves.&rdquo;
              </p>
              <cite className="block not-italic text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">
                &mdash; Founder
              </cite>
            </blockquote>
          </div>
        </section>

        {/* SECTION 3 — Why We Built This */}
        <section className="bg-bg-base py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                The Problem We Solved
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                One tool to replace the chaos.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* LEFT COLUMN — Text Content */}
              <div className="space-y-4">
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  University students juggle too many disconnected tools &mdash;
                  WhatsApp for schedules, Excel for grades, random apps for PDFs.
                </p>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  Scholar Atlas consolidates attendance tracking, task management,
                  CGPA calculation, and PDF processing into a single, unified dashboard.
                </p>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  Everything is free to start, works on any device, and is built
                  with student privacy as a non-negotiable.
                </p>
              </div>

              {/* RIGHT COLUMN — 2x2 Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-[24px] p-6">
                  <span className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    100+
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Students using Scholar Atlas
                  </span>
                </div>
                <div className="glass-card rounded-[24px] p-6">
                  <span className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    4
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Core tools built
                  </span>
                </div>
                <div className="glass-card rounded-[24px] p-6">
                  <span className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    Free
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Forever, no credit card
                  </span>
                </div>
                <div className="glass-card rounded-[24px] p-6">
                  <span className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    2025
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Year the project launched
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Tools Overview */}
        <section className="bg-bg-base py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                What&apos;s Inside
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                Four tools. One command center.
              </h2>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 mt-4">
                Every tool is designed for the university student&apos;s actual workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Attendance Tracker */}
              <div className="glass-card rounded-[24px] p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                  Attendance Tracker
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Log every class and stay safely above the minimum threshold.
                </p>
              </div>

              {/* Task Board */}
              <div className="glass-card rounded-[24px] p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                  Task Board
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Kanban-style board built around assignments, quizzes and deadlines.
                </p>
              </div>

              {/* CGPA Manager */}
              <div className="glass-card rounded-[24px] p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                  CGPA Manager
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Track your grades, forecast your semester, and hit your target GPA.
                </p>
              </div>

              {/* PDF Tools */}
              <div className="glass-card rounded-[24px] p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                  PDF Tools
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Merge, split, and convert PDFs entirely in your browser &mdash; privately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — Principles */}
        <section className="bg-bg-base py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                What we believe in.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Privacy first */}
              <div className="border-l-2 border-indigo-400 pl-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Privacy first
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Your academic data is yours. We don&apos;t sell it, share it, or store
                  what we don&apos;t need.
                </p>
              </div>

              {/* Speed matters */}
              <div className="border-l-2 border-indigo-400 pl-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Speed matters
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Every page loads in under a second. Slow tools cost you time you
                  don&apos;t have.
                </p>
              </div>

              {/* Student focused */}
              <div className="border-l-2 border-indigo-400 pl-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Student focused
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Every design decision is made by asking: does this actually help
                  a student get through the semester?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — CTA */}
        <section className="bg-bg-base py-20 md:py-28 text-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
              Ready to take control of your semester?
            </h2>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 mt-4 mb-10 max-w-xl mx-auto">
              Join 100+ students who stopped juggling apps and started actually
              getting things done.
            </p>
            <div className="flex gap-4 justify-center flex-wrap mt-8">
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started &mdash; it&apos;s free
              </Link>
              <Link
                href="/#features"
                className="border border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Explore features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
