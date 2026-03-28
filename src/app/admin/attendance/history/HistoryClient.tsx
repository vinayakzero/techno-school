"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, Filter, FileText, ChevronRight } from "lucide-react";
import { getAttendanceHistoryAction } from "./actions";

export default function HistoryClient({ 
  initialRecords, 
  grades, 
  sections 
}: { 
  initialRecords: any[], 
  grades: string[], 
  sections: string[] 
}) {
  const [records, setRecords] = useState(initialRecords);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilter = async () => {
    setLoading(true);
    const result = await getAttendanceHistoryAction({ grade, section, startDate, endDate });
    if (result.success) {
      setRecords(result.data);
    }
    setLoading(false);
  };

  const getStats = (attendanceRecords: any[]) => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === "Present").length;
    const late = attendanceRecords.filter(r => r.status === "Late").length;
    const absent = attendanceRecords.filter(r => r.status === "Absent").length;
    return { total, present, late, absent };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Grade</label>
            <select 
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Grades</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Section</label>
            <select 
              value={section}
              onChange={e => setSection(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button 
            onClick={handleFilter}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 h-10 px-4 transition-colors disabled:opacity-50"
          >
            <Filter size={16} />
            {loading ? "Searching..." : "Apply Filters"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Class</th>
                <th className="px-6 py-4 font-medium text-center">Roster Stats</th>
                <th className="px-6 py-4 font-medium text-center">Attendance %</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {records.map((rec) => {
                const stats = getStats(rec.records);
                const percent = Math.round(((stats.present + stats.late) / stats.total) * 100);
                
                return (
                  <tr key={rec._id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-zinc-100">
                            {new Date(rec.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {new Date(rec.date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-zinc-300 font-medium">
                      {rec.grade} - Section {rec.section}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4 text-center">
                        <div>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.present}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Present</p>
                        </div>
                        <div>
                          <p className="text-amber-600 dark:text-amber-400 font-bold">{stats.late}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Late</p>
                        </div>
                        <div>
                          <p className="text-red-600 dark:text-red-400 font-bold">{stats.absent}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Absent</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center justify-between w-20 text-[10px] font-bold text-gray-500 mb-0.5">
                           <span>{percent}%</span>
                        </div>
                        <div className="w-20 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                             style={{ width: `${percent}%` }}
                           />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <a 
                         href={`/admin/attendance?date=${rec.date.split("T")[0]}&grade=${encodeURIComponent(rec.grade)}&section=${rec.section}`}
                         className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Modify
                          <ChevronRight size={14} />
                       </a>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-500">
                    No attendance records found with these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
