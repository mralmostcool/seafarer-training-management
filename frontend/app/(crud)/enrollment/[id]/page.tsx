"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Rank {
  id: string;
  name: string;
  level: number;
}

interface IndosRecord {
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
  createdAt: string;
  updatedAt: string;
}

type EnrollmentStatus = "ENROLLED" | "COMPLETED" | "CANCELLED";

interface EnrollmentDetail {
  id: string;
  preSeaCourse: PreSeaCourseRecord;
  indosMaster: IndosRecord;
  status: EnrollmentStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type TabType = "alpha" | "beta" | "gamma";

export default function EnrollmentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("alpha");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/crud/enrollments/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch enrollment detail (HTTP ${res.status})`);
        }
        const data = await res.json();
        setEnrollment(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred loading details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border border-hairline rounded-lg bg-surface-card">
        <p className="text-muted-text text-sm animate-pulse">Loading enrollment profile...</p>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-brand-error/30 rounded-lg bg-surface-card p-6">
        <p className="text-brand-error text-sm font-semibold">Error loading details: {error || "Enrollment not found"}</p>
        <Link href="/enrollment" className="mt-4 text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider font-mono">
          Back to Enrollments list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <Link
          href="/enrollment"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-ink transition-colors uppercase tracking-wider font-mono"
        >
          ← Back to Enrollments
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        {/* Large Badge */}
        <div className="h-16 w-16 rounded-full bg-surface-soft border border-hairline flex items-center justify-center text-accent-interactive text-2xl font-bold uppercase select-none ring-4 ring-hairline/25 shrink-0 font-sans">
          E
        </div>

        {/* Details Grid */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">
              Enrollment: {enrollment.indosMaster.firstName}
            </h1>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              enrollment.status === "COMPLETED"
                ? "bg-brand-success/15 text-brand-success ring-brand-success/30"
                : enrollment.status === "CANCELLED"
                ? "bg-brand-error/15 text-brand-error ring-brand-error/30"
                : "bg-accent-interactive/15 text-accent-interactive ring-accent-interactive/30"
            }`}>
              {enrollment.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-hairline text-sm">
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Course Program</span>
              <span className="font-bold text-ink text-xs">{enrollment.preSeaCourse.name}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Seafarer (INDOS)</span>
              <span className="font-bold text-ink text-xs">
                {enrollment.indosMaster.firstName} (INDOS: <span className="font-mono text-xs font-bold">{enrollment.indosMaster.indos}</span>)
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Course Start Date</span>
              <span className="font-bold text-ink font-mono text-xs">{enrollment.preSeaCourse.startDate}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Remarks / Comments</span>
              <span className="text-body-text italic text-xs">{enrollment.remarks || "No remarks"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Enrolled At</span>
              <span className="text-muted-text text-xs font-mono">
                {new Date(enrollment.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Last Updated</span>
              <span className="text-muted-text text-xs font-mono">
                {new Date(enrollment.updatedAt).toLocaleDateString(undefined, {
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
          {(["alpha", "beta", "gamma"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold border-b-2 uppercase tracking-wider select-none transition-all font-mono cursor-pointer ${
                activeTab === tab
                  ? "border-primary text-accent-interactive"
                  : "border-transparent text-muted-text hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panel Placeholder Content */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm min-h-[350px]">
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-hairline rounded-lg p-12 text-center">
          <span className="text-2xl font-black tracking-widest uppercase select-none text-hairline-strong font-mono">
            {activeTab} PANEL
          </span>
          <p className="text-xs text-muted-text font-mono mt-2 uppercase tracking-wide">Developer chrome placeholder</p>
        </div>
      </div>
    </div>
  );
}
