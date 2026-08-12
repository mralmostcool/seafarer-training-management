"use client";

import { useEffect, useState } from "react";
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

interface EnrollmentRecord {
  id: string;
  preSeaCourse: PreSeaCourseRecord;
  indosMaster: IndosRecord;
  status: EnrollmentStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

type SortField = "preSeaCourse" | "indosMaster" | "status" | "createdAt" | null;
type SortOrder = "asc" | "desc";
type PanelMode = "add" | "edit" | null;

export default function EnrollmentPage() {
  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
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
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterIndosId, setFilterIndosId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Dropdown data state (for forms and filters)
  const [courses, setCourses] = useState<PreSeaCourseRecord[]>([]);
  const [seafarers, setSeafarers] = useState<IndosRecord[]>([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [dropdownsError, setDropdownsError] = useState<string | null>(null);

  // Side Panel state
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<EnrollmentRecord | null>(null);

  // Form input state
  const [formCourseId, setFormCourseId] = useState("");
  const [formIndosId, setFormIndosId] = useState("");
  const [formStatus, setFormStatus] = useState<EnrollmentStatus>("ENROLLED");
  const [formRemarks, setFormRemarks] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Autocomplete search states
  const [courseSearchInput, setCourseSearchInput] = useState("");
  const [seafarerSearchInput, setSeafarerSearchInput] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [seafarerDropdownOpen, setSeafarerDropdownOpen] = useState(false);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(courseSearchInput.toLowerCase())
  );

  const filteredSeafarers = seafarers.filter((s) =>
    s.firstName.toLowerCase().includes(seafarerSearchInput.toLowerCase()) ||
    s.indos.toLowerCase().includes(seafarerSearchInput.toLowerCase())
  );

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
      if (sortField === "preSeaCourse") sortBy = "preSeaCourse.name";
      else if (sortField === "indosMaster") sortBy = "indosMaster.firstName";
      else if (sortField === "status") sortBy = "status";
      else if (sortField === "createdAt") sortBy = "createdAt";

      const sortDir = sortOrder;
      let url = `http://localhost:8080/api/crud/enrollments/page?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;

      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (filterCourseId) {
        url += `&courseId=${filterCourseId}`;
      }
      if (filterIndosId) {
        url += `&indosMasterId=${filterIndosId}`;
      }
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch enrollment records (HTTP ${res.status})`);
      }
      const data = await res.json();

      setRecords(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);

      if (isManualRefresh) {
        showToast("Enrollment records refreshed successfully", "success");
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred loading records";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    setDropdownsLoading(true);
    setDropdownsError(null);
    try {
      // Fetch pre-sea courses
      const coursesRes = await fetch("http://localhost:8080/api/crud/pre-sea-courses");
      if (!coursesRes.ok) {
        throw new Error(`Failed to fetch courses list (HTTP ${coursesRes.status})`);
      }
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Fetch INDOS records
      const seafarersRes = await fetch("http://localhost:8080/api/crud/indos-master");
      if (!seafarersRes.ok) {
        throw new Error(`Failed to fetch INDOS seafarers list (HTTP ${seafarersRes.status})`);
      }
      const seafarersData = await seafarersRes.json();
      setSeafarers(seafarersData);
    } catch (err: any) {
      const msg = err.message || "Failed to load drop-down option lists";
      setDropdownsError(msg);
      showToast(msg, "warning");
    } finally {
      setDropdownsLoading(false);
    }
  };

  // Initial load of reference dropdown lists
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch paginated data when page, sorting, search query or filters change
  useEffect(() => {
    fetchRecords();
  }, [currentPage, pageSize, sortField, sortOrder, searchQuery, filterCourseId, filterIndosId, filterStatus]);

  const handleCourseFilterChange = (val: string) => {
    setFilterCourseId(val);
    setCurrentPage(0);
  };

  const handleIndosFilterChange = (val: string) => {
    setFilterIndosId(val);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (val: string) => {
    setFilterStatus(val);
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
    setFilterCourseId("");
    setFilterIndosId("");
    setFilterStatus("");
    setCurrentPage(0);
    showToast("Filters cleared", "info");
  };

  const openAddPanel = () => {
    setSelectedRecord(null);
    setFormCourseId("");
    setFormIndosId("");
    setFormStatus("ENROLLED");
    setFormRemarks("");
    setConsentChecked(false);
    setSubmitError(null);
    setCourseSearchInput("");
    setSeafarerSearchInput("");
    setCourseDropdownOpen(false);
    setSeafarerDropdownOpen(false);
    setPanelMode("add");
    showToast("Opening new enrollment panel", "info");
  };

  const openEditPanel = (record: EnrollmentRecord) => {
    setSelectedRecord(record);
    setFormCourseId(record.preSeaCourse.id);
    setFormIndosId(record.indosMaster.id);
    setFormStatus(record.status);
    setFormRemarks(record.remarks || "");
    setConsentChecked(false);
    setSubmitError(null);
    setCourseSearchInput(record.preSeaCourse.name);
    setSeafarerSearchInput(`${record.indosMaster.firstName} (INDOS: ${record.indosMaster.indos})`);
    setCourseDropdownOpen(false);
    setSeafarerDropdownOpen(false);
    setPanelMode("edit");
    showToast(`Editing enrollment for: ${record.indosMaster.firstName}`, "info");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedRecord(null);
    setFormCourseId("");
    setFormIndosId("");
    setFormStatus("ENROLLED");
    setFormRemarks("");
    setConsentChecked(false);
    setSubmitError(null);
    setCourseSearchInput("");
    setSeafarerSearchInput("");
    setCourseDropdownOpen(false);
    setSeafarerDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourseId) {
      const msg = "Please select a pre-sea course";
      setSubmitError(msg);
      showToast(msg, "warning");
      return;
    }
    if (!formIndosId) {
      const msg = "Please select a seafarer (INDOS)";
      setSubmitError(msg);
      showToast(msg, "warning");
      return;
    }
    if (!formStatus) {
      const msg = "Please select an enrollment status";
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
        ? `http://localhost:8080/api/crud/enrollments/${selectedRecord?.id}`
        : "http://localhost:8080/api/crud/enrollments";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        preSeaCourseId: formCourseId,
        indosMasterId: formIndosId,
        status: formStatus,
        remarks: formRemarks.trim() || null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save enrollment (HTTP ${res.status})`);
      }

      showToast(
        isEdit ? "Enrollment updated successfully" : "Enrollment created successfully",
        "success"
      );
      closePanel();
      await fetchRecords(); // Reload current list page
    } catch (err: any) {
      const msg = err.message || "An error occurred while saving the enrollment";
      setSubmitError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the enrollment record for ${selectedRecord.indosMaster.firstName} in ${selectedRecord.preSeaCourse.name}?`
    );
    if (!confirmDelete) return;

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/crud/enrollments/${selectedRecord.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to delete enrollment (HTTP ${res.status})`);
      }

      showToast("Enrollment deleted successfully", "success");
      closePanel();
      await fetchRecords();
    } catch (err: any) {
      const msg = err.message || "An error occurred while deleting the enrollment";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">Course Enrollment</h1>
          <p className="text-sm text-muted-text mt-1">View and manage seafarer course enrollment program entries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddPanel}
            className="inline-flex items-center justify-center rounded-md bg-primary text-on-primary hover:bg-primary-active px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            Enroll Student
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
            placeholder="Search by student name, INDOS number or course name..."
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
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">Course:</span>
            <select
              value={filterCourseId}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className="rounded-md border border-hairline bg-surface-soft px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">Student:</span>
            <select
              value={filterIndosId}
              onChange={(e) => handleIndosFilterChange(e.target.value)}
              className="rounded-md border border-hairline bg-surface-soft px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
            >
              <option value="">All Seafarers</option>
              {seafarers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} ({s.indos})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-text uppercase tracking-wider font-mono">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="rounded-md border border-hairline bg-surface-soft px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
            >
              <option value="">All Statuses</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {(searchQuery || filterCourseId || filterIndosId || filterStatus) && (
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

      {/* Main Table */}
      {loading && records.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-hairline rounded-lg bg-surface-card">
          <p className="text-muted-text text-sm animate-pulse">Loading enrollment records...</p>
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
          <p className="text-muted-text text-sm">No enrollment records found matching filters.</p>
          {(searchQuery || filterCourseId || filterIndosId || filterStatus) && (
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
                    onClick={() => handleSort("preSeaCourse")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Course Program</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "preSeaCourse" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("indosMaster")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Seafarer (INDOS)</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "indosMaster" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "status" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-6 py-3.5 cursor-pointer hover:bg-surface-card transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Enrolled On</span>
                      <span className="text-[10px] text-muted-text group-hover:text-ink">
                        {sortField === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right font-mono uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink font-sans">{record.preSeaCourse.name}</div>
                      <div className="text-xs text-muted-text font-mono">Starts {record.preSeaCourse.startDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink font-sans">{record.indosMaster.firstName}</div>
                      <div className="text-xs text-muted-text font-mono">INDOS: {record.indosMaster.indos} ({record.indosMaster.rank?.name || "No Rank"})</div>
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
                    <td className="px-6 py-4 font-mono text-xs text-muted-text">
                      {new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-4">
                      <Link
                        href={`/enrollment/${record.id}`}
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
              {panelMode === "edit" ? "Edit Course Enrollment" : "Enroll Student"}
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
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Pre-Sea Course Program</label>
                {dropdownsLoading ? (
                  <p className="text-xs text-muted-text animate-pulse mt-2 font-mono uppercase tracking-wider">Loading courses list...</p>
                ) : dropdownsError ? (
                  <p className="text-xs text-brand-error font-semibold mt-2">Failed to load courses list.</p>
                ) : (
                  <div className="relative mt-1">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={courseSearchInput}
                        onChange={(e) => {
                          setCourseSearchInput(e.target.value);
                          setFormCourseId("");
                          setCourseDropdownOpen(true);
                        }}
                        onFocus={() => setCourseDropdownOpen(true)}
                        placeholder="Type to search course..."
                        className={`block w-full rounded-md border ${
                          formCourseId 
                            ? "border-brand-success focus:ring-brand-success focus:border-brand-success" 
                            : "border-hairline bg-surface-soft text-ink focus:ring-primary"
                        } pl-3 pr-16 py-2 text-sm text-ink focus:outline-none focus:ring-1`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {formCourseId && (
                          <span className="text-[9px] font-bold text-brand-success bg-brand-success/15 px-1.5 py-0.5 rounded font-mono uppercase">
                            Selected
                          </span>
                        )}
                        {courseSearchInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setCourseSearchInput("");
                              setFormCourseId("");
                              setCourseDropdownOpen(true);
                            }}
                            className="text-muted-text hover:text-ink text-xs font-bold p-1 cursor-pointer font-mono"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {courseDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setCourseDropdownOpen(false)} />
                        <ul className="absolute z-20 w-full mt-1 bg-surface-card border border-hairline rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredCourses.length === 0 ? (
                            <li className="px-3 py-2 text-xs text-muted-text font-mono">No matching courses found</li>
                          ) : (
                            filteredCourses.map((c) => (
                              <li
                                key={c.id}
                                onClick={() => {
                                  setFormCourseId(c.id);
                                  setCourseSearchInput(c.name);
                                  setCourseDropdownOpen(false);
                                }}
                                className="px-3 py-2 text-sm text-body-text hover:bg-surface-soft hover:text-ink cursor-pointer select-none"
                              >
                                {c.name} {c.isActive ? "" : "(Inactive)"}
                              </li>
                            ))
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Student / Seafarer (INDOS)</label>
                {dropdownsLoading ? (
                  <p className="text-xs text-muted-text animate-pulse mt-2 font-mono uppercase tracking-wider">Loading students list...</p>
                ) : dropdownsError ? (
                  <p className="text-xs text-brand-error font-semibold mt-2">Failed to load seafarers list.</p>
                ) : (
                  <div className="relative mt-1">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={seafarerSearchInput}
                        onChange={(e) => {
                          setSeafarerSearchInput(e.target.value);
                          setFormIndosId("");
                          setSeafarerDropdownOpen(true);
                        }}
                        onFocus={() => setSeafarerDropdownOpen(true)}
                        placeholder="Type to search seafarer..."
                        className={`block w-full rounded-md border ${
                          formIndosId 
                            ? "border-brand-success focus:ring-brand-success focus:border-brand-success" 
                            : "border-hairline bg-surface-soft text-ink focus:ring-primary"
                        } pl-3 pr-16 py-2 text-sm text-ink focus:outline-none focus:ring-1`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {formIndosId && (
                          <span className="text-[9px] font-bold text-brand-success bg-brand-success/15 px-1.5 py-0.5 rounded font-mono uppercase">
                            Selected
                          </span>
                        )}
                        {seafarerSearchInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setSeafarerSearchInput("");
                              setFormIndosId("");
                              setSeafarerDropdownOpen(true);
                            }}
                            className="text-muted-text hover:text-ink text-xs font-bold p-1 cursor-pointer font-mono"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {seafarerDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setSeafarerDropdownOpen(false)} />
                        <ul className="absolute z-20 w-full mt-1 bg-surface-card border border-hairline rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredSeafarers.length === 0 ? (
                            <li className="px-3 py-2 text-xs text-muted-text font-mono">No matching seafarers found</li>
                          ) : (
                            filteredSeafarers.map((s) => (
                              <li
                                key={s.id}
                                onClick={() => {
                                  setFormIndosId(s.id);
                                  setSeafarerSearchInput(`${s.firstName} (INDOS: ${s.indos})`);
                                  setSeafarerDropdownOpen(false);
                                }}
                                className="px-3 py-2 hover:bg-surface-soft cursor-pointer select-none text-body-text hover:text-ink"
                              >
                                <div className="font-bold text-sm">{s.firstName}</div>
                                <div className="text-xs text-muted-text font-mono">INDOS: {s.indos} {s.rank ? `• ${s.rank.name}` : ""}</div>
                              </li>
                            ))
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Status</label>
                <select
                  required
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as EnrollmentStatus)}
                  className="mt-1 block w-full rounded-md border border-hairline bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
                >
                  <option value="ENROLLED">Enrolled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Remarks / Comments</label>
                <textarea
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-hairline bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary min-h-[90px]"
                  placeholder="Remarks or remarks comments..."
                />
              </div>
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
                    disabled={submitLoading || dropdownsLoading || !!dropdownsError || (panelMode === "edit" && !consentChecked)}
                    className="rounded-md bg-primary text-on-primary hover:bg-primary-active px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {submitLoading
                      ? "Saving..."
                      : panelMode === "edit" ? "Save Changes" : "Enroll"}
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
