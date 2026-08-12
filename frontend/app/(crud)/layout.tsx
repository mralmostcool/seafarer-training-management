import Link from "next/link";
import SyncStatus from "@/components/SyncStatus";

export default function CrudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6 flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Seafarer Admin</h2>
            <p className="text-xs text-zinc-500">Management Console</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            <Link
              href="/rank"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <span>Rank Master</span>
            </Link>
            <Link
              href="/indos"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <span>INDOS Master</span>
            </Link>
            <Link
              href="/pre-sea-course"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <span>Pre-Sea Course</span>
            </Link>
          </nav>
        </div>

        <SyncStatus />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
