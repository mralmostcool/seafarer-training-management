"use client";

import { useEffect, useState, useMemo } from "react";

interface Rank {
  id: string;
  name: string;
  level: number;
}

type SortField = "name" | "level" | null;
type SortOrder = "asc" | "desc";

export default function RankPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const fetchRanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/crud/rank-master");
      if (!res.ok) {
        throw new Error(`Failed to fetch ranks (HTTP ${res.status})`);
      }
      const data = await res.json();
      setRanks(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanks();
  }, []);

  const handleSort = (field: "name" | "level") => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedRanks = useMemo(() => {
    if (!sortField) return ranks;

    return [...ranks].sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortField === "level") {
        return sortOrder === "asc"
          ? a.level - b.level
          : b.level - a.level;
      }
      return 0;
    });
  }, [ranks, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Rank Master</h1>
          <p className="text-sm text-zinc-500">View and manage seafarer rank classifications.</p>
        </div>
        <button
          onClick={fetchRanks}
          disabled={loading}
          className="rounded-md bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && ranks.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
          <p className="text-zinc-500 text-sm">Loading ranks...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10 p-6">
          <p className="text-red-800 dark:text-red-400 text-sm font-medium">Error: {error}</p>
          <button
            onClick={fetchRanks}
            className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : ranks.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
          <p className="text-zinc-500 text-sm">No ranks found in database.</p>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("level")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Level</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "level" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortedRanks.map((rank) => (
                <tr key={rank.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{rank.name}</td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{rank.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
