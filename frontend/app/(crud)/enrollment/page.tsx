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
      // Fetch pre-sea courses (all or active)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Course Enrollment</h1>
          <p className="text-sm text-zinc-500">View and manage seafarer course enrollment program entries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddPanel}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Enroll Student
          </button>
          <button
            onClick={() => fetchRecords(true)}
            disabled={loading}
            className="rounded-md bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Search and Filters row */}
      <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm select-none">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by student name, INDOS number or course name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">Course:</span>
            <select
              value={filterCourseId}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-905 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
            <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">Student:</span>
            <select
              value={filterIndosId}
              onChange={(e) => handleIndosFilterChange(e.target.value)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-905 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
            <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-905 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
              className="text-xs font-semibold text-rose-600 dark:text-rose-450 hover:text-rose-500 hover:underline px-2 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading && records.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
          <p className="text-zinc-500 text-sm">Loading enrollment records...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10 p-6">
          <p className="text-red-800 dark:text-red-400 text-sm font-medium">Error: {error}</p>
          <button
            onClick={() => fetchRecords(false)}
            className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 p-6 text-center">
          <p className="text-zinc-500 text-sm">No enrollment records found matching filters.</p>
          {(searchQuery || filterCourseId || filterIndosId || filterStatus) && (
            <button
              onClick={handleClearFilters}
              className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort("preSeaCourse")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Course Program</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "preSeaCourse" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("indosMaster")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Seafarer (INDOS)</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "indosMaster" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "status" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Enrolled On</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">{record.preSeaCourse.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">Starts {record.preSeaCourse.startDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">{record.indosMaster.firstName}</div>
                    <div className="text-xs text-zinc-500 font-mono">INDOS: {record.indosMaster.indos} ({record.indosMaster.rank?.name || "No Rank"})</div>
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
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    {new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3.5">
                    <Link
                      href={`/enrollment/${record.id}`}
                      className="text-sm font-semibold text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => openEditPanel(record)}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 text-sm select-none text-zinc-550 dark:text-zinc-455">
            <div className="flex items-center gap-5">
              <span>
                Showing {totalElements === 0 ? 0 : currentPage * pageSize + 1} to{" "}
                {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} entries
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-750 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>

              <span className="text-xs text-zinc-550 dark:text-zinc-400 px-1 font-medium">
                Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-750 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-50 transition-colors"
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
          className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        />

        {/* Panel Body */}
        <div
          className={`relative w-full max-w-md bg-white dark:bg-zinc-950 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${
            panelMode ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {panelMode === "edit" ? "Edit Course Enrollment" : "Enroll Student"}
            </h2>
            <button
              type="button"
              onClick={closePanel}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-medium p-1"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-5">
              {submitError && (
                <div className="rounded bg-rose-50 dark:bg-rose-950/20 p-3 text-xs text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">Pre-Sea Course Program</label>
                {dropdownsLoading ? (
                  <p className="text-xs text-zinc-500 mt-2">Loading courses list...</p>
                ) : dropdownsError ? (
                  <p className="text-xs text-red-500 mt-2">Failed to load courses list.</p>
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
                            ? "border-green-500 focus:ring-green-550 focus:border-green-550 dark:border-green-600" 
                            : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500 focus:border-blue-500"
                        } bg-white dark:bg-zinc-900 pl-3 pr-16 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {formCourseId && (
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
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
                            className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-xs font-bold p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {courseDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setCourseDropdownOpen(false)} />
                        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredCourses.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-zinc-500">No matching courses found</li>
                          ) : (
                            filteredCourses.map((c) => (
                              <li
                                key={c.id}
                                onClick={() => {
                                  setFormCourseId(c.id);
                                  setCourseSearchInput(c.name);
                                  setCourseDropdownOpen(false);
                                }}
                                className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer select-none"
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
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">Student / Seafarer (INDOS)</label>
                {dropdownsLoading ? (
                  <p className="text-xs text-zinc-500 mt-2">Loading students list...</p>
                ) : dropdownsError ? (
                  <p className="text-xs text-red-500 mt-2">Failed to load seafarers list.</p>
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
                            ? "border-green-500 focus:ring-green-550 focus:border-green-550 dark:border-green-600" 
                            : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500 focus:border-blue-500"
                        } bg-white dark:bg-zinc-900 pl-3 pr-16 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2`}
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {formIndosId && (
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
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
                            className="text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-200 text-xs font-bold p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {seafarerDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setSeafarerDropdownOpen(false)} />
                        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredSeafarers.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-zinc-550">No matching seafarers found</li>
                          ) : (
                            filteredSeafarers.map((s) => (
                              <li
                                key={s.id}
                                onClick={() => {
                                  setFormIndosId(s.id);
                                  setSeafarerSearchInput(`${s.firstName} (INDOS: ${s.indos})`);
                                  setSeafarerDropdownOpen(false);
                                }}
                                className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer select-none"
                              >
                                <div className="font-semibold">{s.firstName}</div>
                                <div className="text-xs text-zinc-500 font-mono">INDOS: {s.indos} {s.rank ? `• ${s.rank.name}` : ""}</div>
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
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</label>
                <select
                  required
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as EnrollmentStatus)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ENROLLED">Enrolled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">Remarks / Comments</label>
                <textarea
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px]"
                  placeholder="e.g. Approved entry with high priority..."
                />
              </div>
            </div>

            {/* Footer with buttons & optional consent */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 mt-8 space-y-4">
              {panelMode === "edit" && (
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consentChecked"
                    required
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="consentChecked" className="text-xs font-medium text-zinc-655 dark:text-zinc-400 select-none cursor-pointer leading-relaxed">
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
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 transition-colors"
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
                    className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading || dropdownsLoading || !!dropdownsError || (panelMode === "edit" && !consentChecked)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
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
            className={`p-4 rounded-lg border shadow-lg flex items-start justify-between transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/50 dark:text-emerald-300"
                : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-900/50 dark:text-rose-300"
                : toast.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-900/50 dark:text-amber-300"
                : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/90 dark:border-blue-900/50 dark:text-blue-300"
            }`}
          >
            <span className="text-sm font-medium pr-4">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-xs font-bold opacity-60 hover:opacity-100 p-0.5 leading-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
