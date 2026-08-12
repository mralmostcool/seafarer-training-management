"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PreSeaCourseRecord {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

type SortField = "name" | "startDate" | "isActive" | null;
type SortOrder = "asc" | "desc";
type PanelMode = "add" | "edit" | null;

export default function PreSeaCoursePage() {
  const [records, setRecords] = useState<PreSeaCourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");

  // Side Panel state
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<PreSeaCourseRecord | null>(null);

  // Form input state
  const [formName, setFormName] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "info" | "success" | "error" | "warning") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4550);
  };

  const fetchRecords = async (isManualRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      let sortBy = "id";
      if (sortField === "name") sortBy = "name";
      else if (sortField === "startDate") sortBy = "startDate";
      else if (sortField === "isActive") sortBy = "isActive";

      const sortDir = sortOrder;
      let url = `http://localhost:8080/api/crud/pre-sea-courses/page?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (filterIsActive) {
        url += `&isActive=${filterIsActive}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch course records (HTTP ${res.status})`);
      }
      const data = await res.json();
      
      setRecords(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      
      if (isManualRefresh) {
        showToast("Records refreshed successfully", "success");
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred loading records";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page, size, sorting, or filter states change
  useEffect(() => {
    fetchRecords();
  }, [currentPage, pageSize, sortField, sortOrder, searchQuery, filterIsActive]);

  const handleActiveFilterChange = (val: string) => {
    setFilterIsActive(val);
    setCurrentPage(0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(0);
    showToast(`Searching for "${searchInput}"`, "info");
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilterIsActive("");
    setCurrentPage(0);
    showToast("Filters cleared", "info");
  };

  const openAddPanel = () => {
    setSelectedRecord(null);
    setFormName("");
    setFormStartDate("");
    setFormIsActive(true);
    setConsentChecked(false);
    setSubmitError(null);
    setPanelMode("add");
    showToast("Opening new course panel", "info");
  };

  const openEditPanel = (record: PreSeaCourseRecord) => {
    setSelectedRecord(record);
    setFormName(record.name);
    setFormStartDate(record.startDate);
    setFormIsActive(record.isActive);
    setConsentChecked(false);
    setSubmitError(null);
    setPanelMode("edit");
    showToast(`Editing course details: ${record.name}`, "info");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedRecord(null);
    setFormName("");
    setFormStartDate("");
    setFormIsActive(true);
    setConsentChecked(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      const msg = "Please enter a valid course name";
      setSubmitError(msg);
      showToast(msg, "warning");
      return;
    }

    if (!formStartDate) {
      const msg = "Please select a valid start date";
      setSubmitError(msg);
      showToast(msg, "warning");
      return;
    }

    if (panelMode === "edit" && !consentChecked) {
      const msg = "Consent is required to submit changes";
      setSubmitError(msg);
      showToast(msg, "warning");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const isEdit = panelMode === "edit";
      const url = isEdit
        ? `http://localhost:8080/api/crud/pre-sea-courses/${selectedRecord?.id}`
        : "http://localhost:8080/api/crud/pre-sea-courses";
      const method = isEdit ? "PUT" : "POST";

      const payload: any = {
        name: formName,
        startDate: formStartDate,
      };
      if (isEdit) {
        payload.isActive = formIsActive;
      } else {
        payload.isActive = true;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save course (HTTP ${res.status})`);
      }

      showToast(
        isEdit ? "Course updated successfully" : "Course created successfully",
        "success"
      );
      closePanel();
      await fetchRecords(); // Reload current page
    } catch (err: any) {
      const msg = err.message || "An error occurred while saving the course";
      setSubmitError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the course "${selectedRecord.name}"?`
    );
    if (!confirmDelete) return;

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/crud/pre-sea-courses/${selectedRecord.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to delete course (HTTP ${res.status})`);
      }

      showToast("Course deleted successfully", "success");
      closePanel();
      await fetchRecords();
    } catch (err: any) {
      const msg = err.message || "An error occurred while deleting the course";
      setSubmitError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSort = (field: Exclude<SortField, null>) => {
    setCurrentPage(0);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">Pre-Sea Course</h1>
          <p className="text-sm text-muted-text mt-1">View and manage maritime pre-sea course programs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddPanel}
            className="inline-flex items-center justify-center rounded-md bg-primary text-on-primary hover:bg-primary-active px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            Add New Course
          </button>
          <button
            onClick={() => fetchRecords(true)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-hairline bg-surface-card hover:bg-surface-soft text-ink px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Search and Filters row */}
      <div className="bg-surface-card p-4 border border-hairline rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Course Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-md border border-hairline bg-surface-soft px-3 py-2 text-sm text-ink placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-md bg-primary text-on-primary hover:bg-primary-active px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">Status:</span>
            <select
              value={filterIsActive}
              onChange={(e) => handleActiveFilterChange(e.target.value)}
              className="rounded-md border border-hairline bg-surface-soft px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {(searchQuery || filterIsActive) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-brand-error hover:underline px-2 py-1.5 transition-all cursor-pointer font-mono uppercase tracking-wider"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      {loading && records.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-hairline rounded-lg bg-surface-card">
          <p className="text-muted-text text-sm animate-pulse">Loading pre-sea courses...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 border border-brand-error/30 rounded-lg bg-surface-card p-6">
          <p className="text-brand-error text-sm font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchRecords(false)}
            className="mt-3 text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-hairline rounded-lg bg-surface-card p-6 text-center">
          <p className="text-muted-text text-sm">No courses found matching filters.</p>
          {(searchQuery || filterIsActive) && (
            <button
              onClick={handleClearFilters}
              className="mt-3 text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider cursor-pointer"
            >
              Clear search filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-hairline rounded-lg overflow-hidden bg-surface-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-hairline text-left text-sm">
              <thead className="bg-surface-soft text-xs font-bold text-muted-text uppercase tracking-wider font-mono select-none">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Course Name</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("startDate")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Start Date</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "startDate" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("isActive")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "isActive" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right font-mono uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-ink font-sans">{record.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-text">{record.startDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        record.isActive
                          ? "bg-brand-success/15 text-brand-success ring-brand-success/30"
                          : "bg-muted-soft/20 text-muted-text ring-hairline-strong"
                      }`}>
                        {record.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-4">
                      <Link
                        href={`/pre-sea-course/${record.id}`}
                        className="text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => openEditPanel(record)}
                        className="text-xs font-bold text-accent-interactive hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-surface-soft px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-hairline text-xs font-mono text-muted-text select-none">
            <div className="flex flex-wrap items-center gap-5">
              <span>
                Showing {totalElements === 0 ? 0 : currentPage * pageSize + 1} to{" "}
                {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} entries
              </span>
              
              <div className="flex items-center gap-2">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="rounded-md border border-hairline bg-surface-card px-2 py-1 text-xs text-ink focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-md border border-hairline bg-surface-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-surface-soft disabled:opacity-40 transition-colors cursor-pointer"
              >
                Prev
              </button>
              
              <span className="px-1">
                Page {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                className="rounded-md border border-hairline bg-surface-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-surface-soft disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in Right Side Panel */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          panelMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div 
          onClick={closePanel} 
          className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        />

        {/* Panel Body */}
        <div 
          className={`relative w-full max-w-md bg-surface-card h-full shadow-2xl border-l border-hairline flex flex-col transition-transform duration-350 ease-in-out ${
            panelMode ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline p-6 bg-surface-soft">
            <h2 className="text-lg font-bold text-ink font-sans tracking-tight">
              {panelMode === "edit" ? "Edit Course Details" : "Add New Course"}
            </h2>
            <button
              type="button"
              onClick={closePanel}
              className="text-muted-text hover:text-ink text-sm font-bold p-1 cursor-pointer font-mono"
            >
              [ESC] ✕
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-surface-card">
            <div className="space-y-5">
              {submitError && (
                <div className="rounded border border-brand-error/20 bg-brand-error/10 p-3 text-xs text-brand-error font-semibold font-mono">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Course Name</label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-hairline bg-surface-soft px-3 py-2 text-sm text-ink placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  placeholder="e.g. BSC Nautical Science"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Start Date</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-hairline bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-mono"
                />
              </div>

              {panelMode === "edit" && (
                <div className="flex items-center gap-2 pt-3 border-t border-hairline">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-hairline bg-surface-soft text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="formIsActive" className="text-sm font-semibold text-body-text select-none cursor-pointer">
                    Active Status (Course is running)
                  </label>
                </div>
              )}
            </div>

            {/* Footer with buttons & optional consent */}
            <div className="border-t border-hairline pt-4 mt-8 space-y-4">
              {panelMode === "edit" && (
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consentChecked"
                    required
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-hairline bg-surface-soft text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="consentChecked" className="text-xs font-semibold text-muted-text select-none cursor-pointer leading-relaxed">
                    I confirm that the modified details are correct and should be saved.
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {panelMode === "edit" ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitLoading}
                    className="rounded-md bg-brand-error text-white hover:opacity-90 px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Delete Record
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="rounded-md border border-hairline bg-surface-soft px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-hairline/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading || (panelMode === "edit" && !consentChecked)}
                    className="rounded-md bg-primary text-on-primary hover:bg-primary-active px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {submitLoading 
                      ? "Saving..." 
                      : panelMode === "edit" ? "Save Changes" : "Add Course"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md border shadow-lg flex items-start justify-between transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-surface-card border-brand-success text-brand-success"
                : toast.type === "error"
                ? "bg-surface-card border-brand-error text-brand-error"
                : toast.type === "warning"
                ? "bg-surface-card border-brand-warning text-brand-warning"
                : "bg-surface-card border-hairline-strong text-ink"
            }`}
          >
            <span className="text-xs font-semibold pr-4">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-xs font-bold opacity-60 hover:opacity-100 p-0.5 leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
