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
      <div className="flex items-center justify-center h-64 border border-hairline rounded-lg bg-surface-card">
        <p className="text-muted-text text-sm animate-pulse">Loading seafarer details profile...</p>
      </div>
    );
  }

  if (error || !seafarer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-brand-error/30 rounded-lg bg-surface-card p-6">
        <p className="text-brand-error text-sm font-semibold">Error loading profile: {error || "Profile not found"}</p>
        <Link href="/indos" className="mt-4 text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider font-mono">
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-ink transition-colors uppercase tracking-wider font-mono"
        >
          ← Back to INDOS Master
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        {/* Large Initials Badge */}
        <div className="h-16 w-16 rounded-full bg-surface-soft border border-hairline flex items-center justify-center text-accent-interactive text-2xl font-bold uppercase select-none ring-4 ring-hairline/25 shrink-0 font-sans">
          {seafarer.firstName.charAt(0)}
        </div>

        {/* Details Grid */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">{seafarer.firstName}</h1>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              seafarer.isActive
                ? "bg-brand-success/15 text-brand-success ring-brand-success/30"
                : "bg-muted-soft/20 text-muted-text ring-hairline-strong"
            }`}>
              {seafarer.isActive ? "Active Seafarer" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-hairline text-sm">
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">INDOS Number</span>
              <span className="font-bold text-ink font-mono text-xs">{seafarer.indos}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Assigned Rank</span>
              <span className="font-bold text-ink font-sans text-xs">
                {seafarer.rank ? `${seafarer.rank.name} (Level ${seafarer.rank.level})` : "None"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Record Registered</span>
              <span className="text-muted-text text-xs font-mono">
                {new Date(seafarer.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Last Modified</span>
              <span className="text-muted-text text-xs font-mono">
                {new Date(seafarer.updatedAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-hairline">
        <nav className="flex space-x-6" aria-label="Tabs">
          {(["enrolled_courses", "beta", "gamma"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold border-b-2 uppercase tracking-wider select-none transition-all font-mono cursor-pointer ${
                activeTab === tab
                  ? "border-primary text-accent-interactive"
                  : "border-transparent text-muted-text hover:text-ink"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panel Content Area */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm min-h-[350px]">
        {activeTab === "enrolled_courses" ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono">Enrolled Course Programs</h3>
            
            {enrollmentsLoading ? (
              <p className="text-xs text-muted-text animate-pulse font-mono uppercase tracking-wider py-8 text-center">Loading course enrollment list...</p>
            ) : enrollmentsError ? (
              <p className="text-sm text-brand-error font-semibold py-8 text-center">Error: {enrollmentsError}</p>
            ) : enrollments.length === 0 ? (
              <p className="text-xs text-muted-text italic py-8 text-center font-mono uppercase tracking-wider">No course enrollments found for this seafarer.</p>
            ) : (
              <div className="border border-hairline rounded-lg overflow-hidden bg-surface-card">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-hairline text-left text-sm">
                    <thead className="bg-surface-soft text-xs font-bold text-muted-text uppercase tracking-wider font-mono select-none">
                      <tr>
                        <th className="px-6 py-3.5">Course Program</th>
                        <th className="px-6 py-3.5">Start Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Remarks</th>
                        <th className="px-6 py-3.5">Date Enrolled</th>
                        <th className="px-6 py-3.5 text-right font-mono">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {enrollments.map((record) => (
                        <tr key={record.id} className="hover:bg-surface-soft/60 transition-colors">
                          <td className="px-6 py-4 font-bold text-ink font-sans">
                            {record.preSeaCourse.name}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-text">
                            {record.preSeaCourse.startDate}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                              record.status === "COMPLETED"
                                ? "bg-brand-success/15 text-brand-success ring-brand-success/30"
                                : record.status === "CANCELLED"
                                ? "bg-brand-error/15 text-brand-error ring-brand-error/30"
                                : "bg-accent-interactive/15 text-accent-interactive ring-accent-interactive/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs italic text-body-text">
                            {record.remarks || "—"}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-text">
                            {new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/enrollment/${record.id}`}
                              className="text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-hairline rounded-lg p-12 text-center">
            <span className="text-2xl font-black tracking-widest uppercase select-none text-hairline-strong font-mono">
              {activeTab} PANEL
            </span>
            <p className="text-xs text-muted-text font-mono mt-2 uppercase tracking-wide">Developer chrome placeholder</p>
          </div>
        )}
      </div>
    </div>
  );
}
