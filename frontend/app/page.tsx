import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col justify-between bg-canvas text-body-text selection:bg-primary selection:text-on-primary">
      {/* Navigation Header */}
      <header className="border-b border-hairline bg-surface-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="font-bold text-ink tracking-tight font-sans">SEAFARER TRAINING MANAGEMENT</span>
        </div>
        <Link
          href="/rank"
          className="text-xs font-semibold text-accent-interactive hover:underline font-mono uppercase tracking-wider"
        >
          Console
        </Link>
      </header>

      {/* Hero Content Section */}
      <section className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-24 flex flex-col justify-center gap-12">
        <div className="space-y-6 max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-surface-card border border-hairline px-3 py-1 text-xs font-semibold text-ink">
            Version 1.0.0 — Live Status
          </span>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-ink tracking-tight leading-none font-sans select-none">
            Modern Seafarer <span className="text-accent-interactive underline decoration-primary decoration-4">Training Console</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-text max-w-2xl leading-relaxed">
            High-performance registers for maritime INDOS profiles, pre-sea course rosters, and real-time training enrollments. Built on near-pure black canvas with electric yellow brand voltage.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link
              href="/indos"
              className="inline-flex items-center justify-center rounded-md bg-primary text-on-primary hover:bg-primary-active px-6 py-3 text-sm font-bold shadow-sm transition-all duration-200 uppercase tracking-wider text-center"
            >
              Launch Console
            </Link>
            <Link
              href="/rank"
              className="inline-flex items-center justify-center rounded-md border border-hairline bg-surface-card text-ink hover:bg-surface-soft px-6 py-3 text-sm font-semibold transition-all duration-200 uppercase tracking-wider text-center"
            >
              Rank Master
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-hairline">
          <div className="p-6 rounded-lg bg-surface-card border border-hairline space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold text-accent-interactive font-sans tracking-tight">100%</div>
            <div className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">WCAG AA Compliant</div>
          </div>
          
          <div className="p-6 rounded-lg bg-surface-card border border-hairline space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold text-accent-interactive font-sans tracking-tight">&lt; 100ms</div>
            <div className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">Live Synchronization</div>
          </div>
          
          <div className="p-6 rounded-lg bg-surface-card border border-hairline space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold text-accent-interactive font-sans tracking-tight">24/7</div>
            <div className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">Real-Time Reliability</div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-hairline bg-surface-card px-6 py-8 text-center text-xs text-muted-text font-mono uppercase tracking-wider">
        Seafarer Training Management System &copy; {new Date().getFullYear()} — Near-pure Black Canvas System
      </footer>
    </main>
  );
}


