"use client";

import { useState, useEffect, useRef } from "react";
import Header, { type TabType } from "./Header";
import {
  type ReportType,
  getStationsByType,
  type TableColumn,
  type TableRow,
} from "../services/stationDataGenerator";

export type ReportColumnConfig = TableColumn;

export type ReportFilterConfig = {
  reportType: ReportType;
  title: string;
  badge: string;
  stationLabel: string; // e.g. Rivers / Stations
  multiSelect?: boolean;
};

export type ReportPageConfig = {
  id: string; // e.g. discharge/aws/rain-gauge
  titleConfig: ReportFilterConfig;
  columns: ReportColumnConfig[];
};

export type FetchDataOptions = {
  stationIds: string[];  // All selected station IDs
  start: Date;
  end: Date;
  page: number;
  pageSize: number;
};

export type FetchDataResult = { rows: TableRow[]; total: number };

export type ExportOptions = {
  stationIds: string[];
  start: Date;
  end: Date;
};

export type ReportPageProps = {
  config: ReportPageConfig;
  fetchData: (options: FetchDataOptions) => Promise<FetchDataResult> | FetchDataResult;
  liveStations?: Array<{ id: string; title: string; chartKey: string }>;  // Override station list with live API data
  onExportPdf?: (options: ExportOptions) => Promise<void> | void;
  onExportExcel?: (options: ExportOptions) => Promise<void> | void;
};

const PAGE_SIZE = 100;

export default function ReportPage({ config, fetchData, liveStations, onExportPdf, onExportExcel }: ReportPageProps) {
  const { titleConfig, columns: configColumns } = config;

  const stations = liveStations ?? getStationsByType(titleConfig.reportType);

  const allStationIds = stations.map((s) => s.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0);
    return { start, end };
  });

  const [columns, setColumns] = useState<TableColumn[]>(configColumns);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);
  const [exportNotification, setExportNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Validate: range must not exceed 7 days
  // Format Date to local datetime-local value (avoids UTC shift from toISOString)
  const toLocalDateTimeString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const rangeMs = timeRange.end.getTime() - timeRange.start.getTime();
  const rangeExceedsWeek = rangeMs > ONE_WEEK_MS;
  const rangeIsInvalid = rangeMs < 0;
  const timeRangeError = rangeExceedsWeek
    ? 'Time range exceeds 7 days. Please select a shorter period.'
    : rangeIsInvalid
      ? 'End time must be after start time.'
      : null;

  // Track which station IDs were used for the last load (for pagination)
  const activeStationIdsRef = useRef<string[]>([]);

  // Core data loading function — accepts explicit stationIds
  const loadData = async (stationIds: string[], page: number) => {
    if (timeRangeError) {
      setTableData([]);
      setTotalRecords(0);
      return;
    }
    activeStationIdsRef.current = stationIds;
    setIsLoading(true);
    setError(null);
    try {
      const result = await Promise.resolve(
        fetchData({
          stationIds,
          start: timeRange.start,
          end: timeRange.end,
          page,
          pageSize: PAGE_SIZE,
        })
      );
      setColumns(configColumns);
      setTableData(result.rows);
      setTotalRecords(result.total);
      setSelectedRow(0);
      setLastUpdated(new Date());
    } catch (e: any) {
      console.error("Failed to load report data", e);
      setError(e?.message || "Failed to load data. Please try again.");
      setTableData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load all data on mount (empty array = all stations)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadData([], 1);
    }
  }, []);

  // When pagination changes, re-fetch with the same station set
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    if (mountedRef.current && currentPage !== prevPageRef.current) {
      prevPageRef.current = currentPage;
      loadData(activeStationIdsRef.current, currentPage);
    }
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const handleTabChange = (tab: TabType | string) => {
    const newTab = tab as TabType;
    if (newTab === "overview") {
      window.location.href = "/overview";
    }
  };

  // Generate Report: call API only for selected stations (empty = all)
  const handleGenerateClick = () => {
    setCurrentPage(1);
    prevPageRef.current = 1;
    loadData(selectedIds, 1);
  };

  const handleExportPdf = async () => {
    if (!onExportPdf || isExporting) return;
    setIsExporting('pdf');
    setExportNotification(null);
    try {
      await onExportPdf({ stationIds: selectedIds, start: timeRange.start, end: timeRange.end });
      setExportNotification({ type: 'success', message: 'PDF downloaded successfully!' });
    } catch (err: any) {
      setExportNotification({ type: 'error', message: err?.message || 'Failed to download PDF' });
    } finally {
      setIsExporting(null);
      setTimeout(() => setExportNotification(null), 4000);
    }
  };

  const handleExportExcel = async () => {
    if (!onExportExcel || isExporting) return;
    setIsExporting('excel');
    setExportNotification(null);
    try {
      await onExportExcel({ stationIds: selectedIds, start: timeRange.start, end: timeRange.end });
      setExportNotification({ type: 'success', message: 'Excel downloaded successfully!' });
    } catch (err: any) {
      setExportNotification({ type: 'error', message: err?.message || 'Failed to download Excel' });
    } finally {
      setIsExporting(null);
      setTimeout(() => setExportNotification(null), 4000);
    }
  };

  return (
    <div
      className="h-screen flex flex-col font-sans"
      style={{ backgroundColor: "#eef2ff" }}
    >
      {/* Export Toast Notification */}
      {exportNotification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all animate-[slideIn_0.3s_ease-out] ${exportNotification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          {exportNotification.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-sm font-semibold">{exportNotification.message}</span>
          <button onClick={() => setExportNotification(null)} className="ml-2 text-current opacity-50 hover:opacity-100">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}

      <Header />

      <main className="flex-1 px-5 2xl:px-8 py-3 2xl:py-4 overflow-hidden">
        <div className="h-full flex flex-col gap-3 2xl:gap-4">
          {/* Top bar: title + filters */}
          <div className="flex gap-3 2xl:gap-4 items-stretch">
            {/* Title */}
            <div
              className="flex-[0.8] rounded-2xl px-7 py-4 flex flex-col justify-center border border-indigo-100"
              style={{ background: "linear-gradient(135deg,#eef2ff,#ffffff)" }}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/90 shadow-md">
                  <span className="text-white text-lg font-bold">
                    {config.id[0]?.toUpperCase() ?? "R"}
                  </span>
                </span>
                <div>
                  <h1 className="text-2xl 2xl:text-3xl font-extrabold tracking-tight text-indigo-900">
                    {titleConfig.title}
                  </h1>
                  <p className="text-xs 2xl:text-sm font-medium text-indigo-700/80 uppercase tracking-[0.18em]">
                    {titleConfig.badge}
                  </p>
                </div>
              </div>

              {/* Status row */}
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] 2xl:text-xs">
                {isLoading && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Loading latest data...
                  </span>
                )}
                {error && !isLoading && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                    {error}
                  </span>
                )}
                {!isLoading && !error && lastUpdated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Updated at {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex-[1.2] rounded-2xl px-4 2xl:px-5 py-3 2xl:py-4 flex flex-col gap-2.5 border border-indigo-100 bg-white/95 backdrop-blur-sm">
              {/* Station multi-select pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] 2xl:text-xs font-semibold text-gray-600 tracking-wide uppercase">
                    {titleConfig.stationLabel}
                  </span>
                  <span className="text-[10px] 2xl:text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {selectedIds.length} Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
                  {stations.map((station) => {
                    const active = selectedIds.includes(station.id);
                    return (
                      <button
                        key={station.id}
                        type="button"
                        onClick={() => {
                          if (!titleConfig.multiSelect) {
                            setSelectedIds([station.id]);
                          } else {
                            setSelectedIds((prev) =>
                              prev.includes(station.id)
                                ? prev.filter((id) => id !== station.id)
                                : [...prev, station.id]
                            );
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] 2xl:text-xs font-semibold border shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${active
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
                          }`}
                      >
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {station.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time range + action buttons */}
              <div className="flex items-end gap-2.5 2xl:gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-gray-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs 2xl:text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 ${timeRangeError ? 'border-red-400' : 'border-gray-300'}`}
                    value={toLocalDateTimeString(timeRange.start)}
                    onChange={(e) => {
                      const newStart = new Date(e.target.value);
                      setTimeRange((prev) => ({ start: newStart, end: prev.end }));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-gray-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs 2xl:text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 ${timeRangeError ? 'border-red-400' : 'border-gray-300'}`}
                    value={toLocalDateTimeString(timeRange.end)}
                    onChange={(e) => {
                      const newEnd = new Date(e.target.value);
                      setTimeRange((prev) => ({ start: prev.start, end: newEnd }));
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5 min-w-[132px]">
                  <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={!!timeRangeError}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs 2xl:text-sm font-semibold text-white shadow-md cursor-pointer ${timeRangeError ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    <span className={`inline-flex h-1.5 w-1.5 rounded-full ${timeRangeError ? 'bg-gray-300' : 'bg-emerald-300 '}`} />
                    Generate Report
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      disabled={!!timeRangeError || isExporting === 'pdf'}
                      className={` cursor-pointer inline-flex flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] 2xl:text-xs font-semibold ${timeRangeError || isExporting === 'pdf' ? 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed' : 'text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100'}`}
                    >
                      {isExporting === 'pdf' ? (
                        <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Downloading...</>
                      ) : 'PDF'}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      disabled={!!timeRangeError || isExporting === 'excel'}
                      className={` cursor-pointer inline-flex flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] 2xl:text-xs font-semibold ${timeRangeError || isExporting === 'excel' ? 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed' : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      {isExporting === 'excel' ? (
                        <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Downloading...</>
                      ) : 'Excel'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Red warning banner when time range is invalid */}
              {timeRangeError && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 mt-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs 2xl:text-sm font-semibold text-red-700">{timeRangeError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main table card */}
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col border border-indigo-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            {/* Table - Scrollable */}
            <div
              className="flex-1 overflow-auto relative"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-gray-800 text-sm font-semibold tracking-wide">
                      Loading {config.titleConfig.title.toLowerCase()}...
                    </span>
                  </div>
                </div>
              )}
              {!isLoading && error && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                  <div className="text-center max-w-sm px-4">
                    <p className="text-sm font-semibold text-rose-700 mb-1">
                      Unable to load data
                    </p>
                    <p className="text-[11px] text-rose-500 mb-2">{error}</p>
                    <p className="text-[11px] text-gray-500">
                      Check your connection or try adjusting filters and click
                      Generate again.
                    </p>
                  </div>
                </div>
              )}
              {!isLoading && !error && tableData.length === 0 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                  <div className="text-center max-w-sm px-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      No data for selected criteria
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Try a different time range or station selection, then
                      generate again.
                    </p>
                  </div>
                </div>
              )}
              <table className="w-full text-[11px] 2xl:text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-2.5 py-1.5 overflow-hidden font-extrabold text-[11px] 2xl:text-xs tracking-wide uppercase text-slate-800 border-r text-${col.align}`}
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        {col.label.length > 18
                          ? col.label.substring(0, 15) + "..."
                          : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedRow(index)}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor:
                          selectedRow === index
                            ? "rgba(79, 70, 229, 0.12)"
                            : index % 2 === 0
                              ? "#FFFFFF"
                              : "#F3F4F6",
                        color: "#111827",
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-2.5 py-1.5 overflow-hidden border-r text-[11px] 2xl:text-xs font-medium text-${col.align}`}
                          style={{ borderColor: "#E5E7EB" }}
                        >
                          {row[col.key] as any}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Controls */}
            <div
              className="px-4 py-2.5 flex items-center justify-between flex-shrink-0 border-t bg-indigo-50/80"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="flex items-center gap-3 text-[11px] 2xl:text-xs text-gray-700">
                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                <span>
                  Showing{" "}
                  <span className="font-semibold">{tableData.length}</span> of{" "}
                  <span className="font-semibold">{totalRecords}</span> records
                  {selectedIds.length > 0 && (
                    <>
                      {" "}for{" "}
                      <span className="font-semibold">{selectedIds.length}</span>{" "}
                      selected station{selectedIds.length === 1 ? "" : "s"}
                    </>
                  )}
                  {selectedIds.length === 0 && (
                    <> (all stations)</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] 2xl:text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${currentPage === 1 || isLoading
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                >
                  Prev
                </button>
                <span className="px-2 text-gray-700">
                  Page <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${currentPage >= totalPages || isLoading
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
