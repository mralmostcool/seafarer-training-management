"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Rank {
  id: string;
  name: string;
  level: number;
}

interface SeafarerDetail {
  id: string;
  indos: string;
  firstName: string;
  rank: Rank | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PreSeaCourseRecord {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
}

type EnrollmentStatus = "ENROLLED" | "COMPLETED" | "CANCELLED";

interface EnrollmentRecord {
  id: string;
  preSeaCourse: PreSeaCourseRecord;
  status: EnrollmentStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type TabType = "enrolled_courses" | "beta" | "gamma";

export default function SeafarerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [seafarer, setSeafarer] = useState<SeafarerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("enrolled_courses");

  // Enrollments data state
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8080/api/crud/indos-master/page?search=${encodeURIComponent(id)}&size=1`);
        if (!res.ok) {
          throw new Error(`Failed to fetch seafarer profile (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (data.content && data.content.length > 0) {
          setSeafarer(data.content[0]);
        } else {
          throw new Error(`No seafarer found with INDOS "${id}"`);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred loading details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!seafarer) return;

    const fetchEnrollments = async () => {
      setEnrollmentsLoading(true);
      setEnrollmentsError(null);
      try {
        const res = await fetch(`http://localhost:8080/api/crud/enrollments/page?indosMasterId=${seafarer.id}&size=100`);
        if (!res.ok) {
          throw new Error(`Failed to fetch enrollments (HTTP ${res.status})`);
        }
        const data = await res.json();
        setEnrollments(data.content || []);
      } catch (err: any) {
        setEnrollmentsError(err.message || "An error occurred while loading courses list");
      } finally {
        setEnrollmentsLoading(false);
      }
    };

    fetchEnrollments();
  }, [seafarer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 text-sm animate-pulse">Loading seafarer details profile...</p>
      </div>
    );
  }

  if (error || !seafarer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10 p-6">
        <p className="text-red-800 dark:text-red-400 text-sm font-medium">Error: {error || "Profile not found"}</p>
        <Link href="/indos" className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Back to INDOS Master list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <Link 
          href="/indos" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
        >
          ← Back to INDOS Master
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        {/* Large Initials Badge */}
        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-700 dark:text-blue-400 text-2xl font-bold uppercase select-none ring-4 ring-blue-50 dark:ring-blue-900/20 shrink-0">
          {seafarer.firstName.charAt(0)}
        </div>

        {/* Details Grid */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{seafarer.firstName}</h1>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
              seafarer.isActive
                ? "bg-green-50 text-green-700 ring-green-650/10 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                : "bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20"
            }`}>
              {seafarer.isActive ? "Active Seafarer" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-sm">
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">INDOS Number</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">{seafarer.indos}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assigned Rank</span>
              <span className="font-semibold text-zinc-905 dark:text-zinc-200">
                {seafarer.rank ? `${seafarer.rank.name} (Level ${seafarer.rank.level})` : "None"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Record Registered</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                {new Date(seafarer.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Modified</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                {new Date(seafarer.updatedAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex space-x-6" aria-label="Tabs">
          {(["enrolled_courses", "beta", "gamma"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold border-b-2 uppercase tracking-wider select-none transition-all ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panel Content Area */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm min-h-[350px]">
        {activeTab === "enrolled_courses" ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Enrolled Course Programs</h3>
            
            {enrollmentsLoading ? (
              <p className="text-sm text-zinc-500 animate-pulse">Loading course enrollment list...</p>
            ) : enrollmentsError ? (
              <p className="text-sm text-red-500">Error: {enrollmentsError}</p>
            ) : enrollments.length === 0 ? (
              <p className="text-sm text-zinc-500 italic py-8 text-center">No course enrollments found for this seafarer.</p>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-wider select-none">
                    <tr>
                      <th className="px-6 py-3">Course Program</th>
                      <th className="px-6 py-3">Start Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Remarks</th>
                      <th className="px-6 py-3">Date Enrolled</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {enrollments.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">
                          {record.preSeaCourse.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-650 dark:text-zinc-400">
                          {record.preSeaCourse.startDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                            record.status === "COMPLETED"
                              ? "bg-green-50 text-green-700 ring-green-650/10 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                              : record.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-700 ring-rose-650/10 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                              : "bg-blue-50 text-blue-700 ring-blue-650/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs italic text-zinc-600 dark:text-zinc-400">
                          {record.remarks || "—"}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/enrollment/${record.id}`}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[350px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/20 via-transparent to-zinc-50/10 dark:from-zinc-900/10 dark:to-zinc-900/5 pointer-events-none" />
            <h3 className="text-7xl md:text-9xl font-black tracking-widest uppercase select-none text-zinc-150 dark:text-zinc-850/80 transition-all duration-500 group-hover:scale-105">
              {activeTab}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
