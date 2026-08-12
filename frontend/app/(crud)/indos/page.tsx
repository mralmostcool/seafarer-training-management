"use client";

import { useEffect, useState, useMemo } from "react";

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

interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

type SortField = "indos" | "firstName" | "rank" | "isActive" | null;
type SortOrder = "asc" | "desc";
type PanelMode = "add" | "edit" | null;

export default function IndosMasterPage() {
  const [records, setRecords] = useState<IndosRecord[]>([]);
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
  const [filterRankId, setFilterRankId] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");

  // Side Panel state
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<IndosRecord | null>(null);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [ranksLoading, setRanksLoading] = useState(false);
  const [ranksError, setRanksError] = useState<string | null>(null);

  // Form input state
  const [formIndos, setFormIndos] = useState("");
  const [formFirstName, setFormFirstName] = useState("");
  const [formRankId, setFormRankId] = useState("");
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
      if (sortField === "indos") sortBy = "indos";
      else if (sortField === "firstName") sortBy = "firstName";
      else if (sortField === "rank") sortBy = "rank.level";
      else if (sortField === "isActive") sortBy = "isActive";

      const sortDir = sortOrder;
      let url = `http://localhost:8080/api/crud/indos-master/page?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (filterRankId) {
        url += `&rankId=${filterRankId}`;
      }
      if (filterIsActive) {
        url += `&isActive=${filterIsActive}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch INDOS records (HTTP ${res.status})`);
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

  const fetchRanks = async () => {
    setRanksLoading(true);
    setRanksError(null);
    try {
      const res = await fetch("http://localhost:8080/api/crud/rank-master");
      if (!res.ok) {
        throw new Error(`Failed to fetch ranks (HTTP ${res.status})`);
      }
      const data = await res.json();
      setRanks(data);
    } catch (err: any) {
      const msg = err.message || "Failed to load ranks list";
      setRanksError(msg);
      showToast(msg, "warning");
    } finally {
      setRanksLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRanks();
  }, []);

  // Fetch when page, size, sorting, or active filter states change
  useEffect(() => {
    fetchRecords();
  }, [currentPage, pageSize, sortField, sortOrder, searchQuery, filterRankId, filterIsActive]);

  const handleRankFilterChange = (val: string) => {
    setFilterRankId(val);
    setCurrentPage(0);
  };

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
    setFilterRankId("");
    setFilterIsActive("");
    setCurrentPage(0);
    showToast("Filters cleared", "info");
  };

  const openAddPanel = () => {
    setSelectedRecord(null);
    setFormIndos("");
    setFormFirstName("");
    setFormRankId("");
    setFormIsActive(true);
    setConsentChecked(false);
    setSubmitError(null);
    setPanelMode("add");
    showToast("Opening new record panel", "info");
  };

  const openEditPanel = (record: IndosRecord) => {
    setSelectedRecord(record);
    setFormIndos(record.indos);
    setFormFirstName(record.firstName);
    setFormRankId(record.rank?.id || "");
    setFormIsActive(record.isActive);
    setConsentChecked(false);
    setSubmitError(null);
    setPanelMode("edit");
    showToast(`Editing profile for: ${record.firstName}`, "info");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedRecord(null);
    setFormIndos("");
    setFormFirstName("");
    setFormRankId("");
    setFormIsActive(true);
    setConsentChecked(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRankId) {
      const msg = "Please select a valid rank";
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
        ? `http://localhost:8080/api/crud/indos-master/${selectedRecord?.id}`
        : "http://localhost:8080/api/crud/indos-master";
      const method = isEdit ? "PUT" : "POST";

      const payload: any = {
        indos: formIndos,
        firstName: formFirstName,
        rankId: formRankId,
      };
      if (isEdit) {
        payload.isActive = formIsActive;
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
        throw new Error(errorData.message || `Failed to save record (HTTP ${res.status})`);
      }

      showToast(
        isEdit ? "Record updated successfully" : "Record created successfully",
        "success"
      );
      closePanel();
      await fetchRecords(); // Reload current page
    } catch (err: any) {
      const msg = err.message || "An error occurred while saving the record";
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">INDOS Master</h1>
          <p className="text-sm text-zinc-500">View and manage seafarer INDOS database records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddPanel}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Add New Record
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
            placeholder="Search by INDOS or First Name..."
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
            <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">Rank:</span>
            <select
              value={filterRankId}
              onChange={(e) => handleRankFilterChange(e.target.value)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-905 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Ranks</option>
              {ranks.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">Status:</span>
            <select
              value={filterIsActive}
              onChange={(e) => handleActiveFilterChange(e.target.value)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-905 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {(searchQuery || filterRankId || filterIsActive) && (
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
          <p className="text-zinc-500 text-sm">Loading records...</p>
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
          <p className="text-zinc-500 text-sm">No records found matching filters.</p>
          {(searchQuery || filterRankId || filterIsActive) && (
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
                  onClick={() => handleSort("indos")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>INDOS Number</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "indos" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("firstName")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>First Name</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "firstName" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("rank")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rank</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "rank" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("isActive")}
                  className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sortField === "isActive" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-950 dark:text-zinc-50 font-mono text-xs">{record.indos}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{record.firstName}</td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{record.rank?.name || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      record.isActive
                        ? "bg-green-50 text-green-700 ring-green-650/10 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                        : "bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20"
                    }`}>
                      {record.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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
          <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 text-sm select-none text-zinc-550 dark:text-zinc-450">
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
              {panelMode === "edit" ? "Edit INDOS Record" : "Add New INDOS Record"}
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
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">INDOS Number</label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={formIndos}
                  onChange={(e) => setFormIndos(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 12AB345"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  required
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. John"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">Rank</label>
                {ranksLoading ? (
                  <p className="text-xs text-zinc-500 mt-2">Loading ranks from database...</p>
                ) : ranksError ? (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-red-500 font-medium">Error: {ranksError}</span>
                    <button type="button" onClick={fetchRanks} className="text-xs text-blue-500 hover:underline">Retry</button>
                  </div>
                ) : (
                  <select
                    required
                    value={formRankId}
                    onChange={(e) => setFormRankId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Rank</option>
                    {ranks.map((rank) => (
                      <option key={rank.id} value={rank.id}>
                        {rank.name} (Level {rank.level})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {panelMode === "edit" && (
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="formIsActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">
                    Active Status (Record is active)
                  </label>
                </div>
              )}
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
                  <label htmlFor="consentChecked" className="text-xs font-medium text-zinc-650 dark:text-zinc-400 select-none cursor-pointer leading-relaxed">
                    I confirm that the modified details are correct and should be saved.
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || ranksLoading || !!ranksError || (panelMode === "edit" && !consentChecked)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {submitLoading 
                    ? "Saving..." 
                    : panelMode === "edit" ? "Save Changes" : "Add Record"}
                </button>
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
