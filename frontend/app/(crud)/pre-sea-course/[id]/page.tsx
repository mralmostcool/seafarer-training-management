"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface CourseDetail {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type TabType = "alpha" | "beta" | "gamma";

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("alpha");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8080/api/crud/pre-sea-courses/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch course detail (HTTP ${res.status})`);
        }
        const data = await res.json();
        setCourse(data);
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
      <div className="flex items-center justify-center h-64 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 text-sm animate-pulse">Loading course profile...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10 p-6">
        <p className="text-red-800 dark:text-red-400 text-sm font-medium">Error: {error || "Course not found"}</p>
        <Link href="/pre-sea-course" className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Back to Pre-Sea Courses list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <Link 
          href="/pre-sea-course" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
        >
          ← Back to Pre-Sea Courses
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        {/* Large Initials Badge */}
        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-700 dark:text-blue-400 text-2xl font-bold uppercase select-none ring-4 ring-blue-55 dark:ring-blue-900/20 shrink-0">
          C
        </div>

        {/* Details Grid */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{course.name}</h1>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
              course.isActive
                ? "bg-green-50 text-green-700 ring-green-650/10 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                : "bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20"
            }`}>
              {course.isActive ? "Active Course" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-sm">
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Course Program</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{course.name}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Date</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-xs">{course.startDate}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registered At</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                {new Date(course.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Updated</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                {new Date(course.updatedAt).toLocaleDateString(undefined, {
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
          {(["alpha", "beta", "gamma"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold border-b-2 uppercase tracking-wider select-none transition-all ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panel Placeholder Content */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-20 flex items-center justify-center min-h-[350px] shadow-inner relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/20 via-transparent to-zinc-50/10 dark:from-zinc-900/10 dark:to-zinc-900/5 pointer-events-none" />
        <h3 className="text-7xl md:text-9xl font-black tracking-widest uppercase select-none text-zinc-150 dark:text-zinc-855/80 transition-all duration-500 group-hover:scale-105">
          {activeTab}
        </h3>
      </div>
    </div>
  );
}
