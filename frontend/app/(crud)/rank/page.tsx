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
      const res = await fetch("/api/crud/rank-master");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">Rank Master</h1>
          <p className="text-sm text-muted-text mt-1">View and manage seafarer rank classifications.</p>
        </div>
        <button
          onClick={fetchRanks}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md border border-hairline bg-surface-card hover:bg-surface-soft text-ink px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && ranks.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-hairline rounded-lg bg-surface-card">
          <p className="text-muted-text text-sm animate-pulse">Loading ranks database...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 border border-brand-error/30 rounded-lg bg-surface-card p-6">
          <p className="text-brand-error text-sm font-semibold">Error loading data: {error}</p>
          <button
            onClick={fetchRanks}
            className="mt-3 text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider"
          >
            Try Again
          </button>
        </div>
      ) : ranks.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-hairline rounded-lg bg-surface-card">
          <p className="text-muted-text text-sm">No ranks found in database.</p>
        </div>
      ) : (
        <div className="border border-hairline rounded-lg overflow-hidden bg-surface-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-hairline text-left text-sm">
              <thead className="bg-surface-soft text-xs font-bold text-muted-text uppercase tracking-wider font-mono select-none">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("level")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Level</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "level" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {sortedRanks.map((rank) => (
                  <tr key={rank.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-ink font-sans">{rank.name}</td>
                    <td className="px-6 py-4 font-mono text-muted-text">{rank.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

