"use client";

import { useState } from "react";
import { saveAttendanceAction } from "./actions";
import { Check, X, Clock, HelpCircle } from "lucide-react";

export default function AttendanceForm({ students, existingRecords, dateString, grade, section, holidayEvent }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Initialize state map: { studentId: "Present" | "Absent" | "Late" | "Excused" }
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    if (existingRecords && existingRecords.length > 0) {
      existingRecords.forEach((record: any) => {
        initialState[record.studentId] = record.status;
      });
      // Ensure all students have a state, defaulting to what's in DB or Present
      students.forEach((s: any) => {
        if (!initialState[s._id]) initialState[s._id] = "Present";
      });
    } else {
      // Default all to Present
      students.forEach((s: any) => {
        initialState[s._id] = "Present";
      });
    }
    return initialState;
  });

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    setSuccess(false); // hide success message if modifying
  };

  const handleSetAll = (status: string) => {
    const newState: Record<string, string> = {};
    students.forEach((s: any) => {
      newState[s._id] = status;
    });
    setAttendanceState(newState);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (holidayEvent) {
      alert(`Attendance is blocked because "${holidayEvent.title}" is marked as a holiday.`);
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    
    // Convert object dictionary back into array for server
    const records = Object.keys(attendanceState).map(studentId => ({
      studentId,
      status: attendanceState[studentId]
    }));

    const result = await saveAttendanceAction(dateString, grade, section, records);
    
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Failed to save attendance: " + result.error);
    }
  };

  const getStatusClasses = (currentStatus: string, targetStatus: string, colorClass: string) => {
    const isActive = currentStatus === targetStatus;
    if (!isActive) return "text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-transparent";
    return colorClass;
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex justify-end gap-2 text-sm">
        <span className="text-gray-500 dark:text-zinc-400 mr-2 flex items-center">Mark All:</span>
        <button disabled={!!holidayEvent} onClick={() => handleSetAll("Present")} className="px-3 py-1.5 rounded-md font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Present</button>
        <button disabled={!!holidayEvent} onClick={() => handleSetAll("Absent")} className="px-3 py-1.5 rounded-md font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Absent</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <th className="px-6 py-4 font-medium w-1/3">Student Name</th>
              <th className="px-6 py-4 font-medium w-1/4">Registration ID</th>
              <th className="px-6 py-4 font-medium min-w-[320px]">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {students.map((student: any) => {
              const currentStatus = attendanceState[student._id];
              return (
                <tr key={student._id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs shrink-0">
                        {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-zinc-100">{student.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 font-mono text-xs">
                    {student._id.substring(18).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 p-1 bg-gray-100/50 dark:bg-zinc-950/50 rounded-lg inline-flex border border-gray-200 dark:border-zinc-800">
                      <button 
                        disabled={!!holidayEvent}
                        onClick={() => handleStatusChange(student._id, "Present")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${getStatusClasses(currentStatus, "Present", "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-black/5 dark:ring-white/10")}`}
                      >
                        <Check size={14} /> Present
                      </button>
                      <button 
                        disabled={!!holidayEvent}
                        onClick={() => handleStatusChange(student._id, "Absent")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${getStatusClasses(currentStatus, "Absent", "bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-md ring-1 ring-black/5 dark:ring-white/10")}`}
                      >
                        <X size={14} /> Absent
                      </button>
                      <button 
                        disabled={!!holidayEvent}
                        onClick={() => handleStatusChange(student._id, "Late")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${getStatusClasses(currentStatus, "Late", "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-md ring-1 ring-black/5 dark:ring-white/10")}`}
                      >
                        <Clock size={14} /> Late
                      </button>
                      <button 
                        disabled={!!holidayEvent}
                        onClick={() => handleStatusChange(student._id, "Excused")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${getStatusClasses(currentStatus, "Excused", "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-black/5 dark:ring-white/10")}`}
                      >
                        <HelpCircle size={14} /> Excused
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:px-6 py-5 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-xl">
        <div className="text-sm font-medium">
          {success && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Check size={16}/> Attendance recorded successfully!</span>}
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !!holidayEvent}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 h-10 px-8 transition-colors disabled:opacity-70 shadow-sm"
        >
          {holidayEvent ? "Attendance Disabled on Holiday" : isSubmitting ? "Saving..." : "Save Daily Attendance"}
        </button>
      </div>
    </div>
  );
}
