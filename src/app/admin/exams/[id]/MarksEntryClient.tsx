"use client";

import { useState } from "react";
import { ArrowLeft, Save, FileSpreadsheet } from "lucide-react";
import { submitMarksAction } from "../actions";
import Link from "next/link";
import { formatShortDate } from "@/lib/date";

export default function MarksEntryClient({ 
  exam, 
  students, 
  results 
}: { 
  exam: any, 
  students: any[], 
  results: any[] 
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Map students to their existing marks, initializing at 0 if none found.
  const initialMarksState = students.reduce((acc, student) => {
    const existingRow = results.find((r) => r.student === student._id);
    acc[student._id] = {
      marksObtained: existingRow ? existingRow.marksObtained : 0,
      remarks: existingRow?.remarks || ""
    };
    return acc;
  }, {});

  const [marksData, setMarksData] = useState<Record<string, { marksObtained: number, remarks: string }>>(initialMarksState);

  const handleScoreChange = (studentId: string, value: number) => {
    // Basic bounds checking
    const validVal = Math.min(Math.max(0, value), exam.totalMarks);
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marksObtained: validVal }
    }));
  };

  const handleRemarksChange = (studentId: string, text: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks: text }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Format dictionary into the array structure expected by the server action
    const bulkArray = Object.keys(marksData).map(studentId => ({
      student: studentId,
      marksObtained: marksData[studentId].marksObtained,
      remarks: marksData[studentId].remarks
    }));

    const res = await submitMarksAction(exam._id, bulkArray);

    if (res.success) {
      setMessage({ type: "success", text: "Marks successfully synchronized and saved." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save marks." });
    }
    
    setLoading(false);
    
    // Auto-hide success
    if (res.success) {
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Context Link */}
      <Link href="/admin/exams" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
        <ArrowLeft size={16} /> Back to Exams
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <FileSpreadsheet className="text-blue-600" />
            {exam.name}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2 font-medium">
            Subject: <span className="text-gray-900 dark:text-zinc-200">{exam.subject?.name}</span> • 
            Grade: <span className="text-gray-900 dark:text-zinc-200">{exam.grade}</span> • 
            Tested: <span className="text-gray-900 dark:text-zinc-200">{formatShortDate(exam.date)}</span>
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
            Max Score: {exam.totalMarks}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? "Saving..." : "Save All Marks"}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-medium text-sm flex items-center justify-between ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
        }`}>
          {message.text}
          <button onClick={() => setMessage({ type: "", text: "" })} className="opacity-70 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Spreadsheet Form View */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 border-b border-gray-200 dark:border-zinc-800 top-0 sticky">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Student Name</th>
                <th className="px-6 py-4 font-semibold w-[150px]">Score (/{exam.totalMarks})</th>
                <th className="px-6 py-4 font-semibold text-center w-[100px]">Perf%</th>
                <th className="px-6 py-4 font-semibold">Teacher Remarks (Visible on Report Card)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400 italic">
                    No active students enrolled in {exam.grade}. Look under the Students tab to enroll a new batch.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const sMarks = marksData[student._id]?.marksObtained || 0;
                  const ratio = ((sMarks / exam.totalMarks) * 100).toFixed(1);
                  
                  return (
                  <tr key={student._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-zinc-200">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        min={0}
                        max={exam.totalMarks}
                        value={sMarks || ""}
                        onChange={(e) => handleScoreChange(student._id, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-black
                         ${parseFloat(ratio) >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
                           parseFloat(ratio) >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' :
                           parseFloat(ratio) >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                           'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                         }`}>
                         {ratio}%
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        value={marksData[student._id]?.remarks || ""}
                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-transparent hover:border-gray-200 focus:border-gray-300 dark:hover:border-zinc-700 dark:focus:border-zinc-600 bg-transparent hover:bg-white focus:bg-white dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 text-sm text-gray-900 dark:text-zinc-200 transition-colors focus:ring-0 outline-none"
                        placeholder="Add a comment... (e.g. Needs improvement in essay phrasing)"
                      />
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
