"use client";

import { useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createEventAction, updateEventAction } from "./actions";

const EVENT_TYPES = ["Holiday", "Exam", "Meeting", "Activity", "Deadline"];
const AUDIENCES = ["School", "Teachers", "Students", "Parents", "Admin"];
const GRADES = ["", "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const MEETING_MODES = ["In Person", "Online", "Hybrid"];

export default function EventForm({
  event,
  onClose,
  teachers,
}: {
  event?: any;
  onClose: () => void;
  teachers: any[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventType, setEventType] = useState(event?.type || "Activity");
  const isEdit = !!event;

  const inputClass = "w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(formRef.current!);
    const result = isEdit
      ? await updateEventAction(event._id, formData)
      : await createEventAction(formData);

    setSubmitting(false);

    if (result.success) {
      router.refresh();
      onClose();
      return;
    }

    setError(result.error || "Unable to save event.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              {isEdit ? "Edit Event" : "Add Event"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Schedule holidays, exams, meetings, and key school activities.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-5">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={event?.title}
                  className={inputClass}
                  placeholder="e.g. Parent Teacher Meeting"
                  autoFocus
                />
              </div>

              <div>
                <label className={labelClass}>Type *</label>
                <select
                  name="type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={inputClass}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Audience *</label>
                <select name="audience" defaultValue={event?.audience || "School"} className={inputClass}>
                  {AUDIENCES.map((audience) => (
                    <option key={audience} value={audience}>{audience}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Start Date *</label>
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={event?.startDate ? new Date(event.startDate).toISOString().split("T")[0] : ""}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>End Date *</label>
                <input
                  name="endDate"
                  type="date"
                  required
                  defaultValue={event?.endDate ? new Date(event.endDate).toISOString().split("T")[0] : ""}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Grade Scope</label>
                <select name="grade" defaultValue={event?.grade || ""} className={inputClass}>
                  <option value="">All grades / not grade-specific</option>
                  {GRADES.filter(Boolean).map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={event?.description}
                  className={`${inputClass} resize-none`}
                  placeholder="Add event details or instructions."
                />
              </div>

              {eventType === "Meeting" && (
                <>
                  <div>
                    <label className={labelClass}>Host Teacher</label>
                    <select
                      name="hostTeacher"
                      defaultValue={event?.meetingDetails?.hostTeacher?._id || event?.meetingDetails?.hostTeacher || ""}
                      className={inputClass}
                    >
                      <option value="">Select teacher...</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Meeting Mode</label>
                    <select
                      name="meetingMode"
                      defaultValue={event?.meetingDetails?.meetingMode || "In Person"}
                      className={inputClass}
                    >
                      {MEETING_MODES.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Venue / Link</label>
                    <input
                      name="venue"
                      defaultValue={event?.meetingDetails?.venue || ""}
                      className={inputClass}
                      placeholder="Room 204 / Google Meet link"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Time Slot</label>
                    <input
                      name="slotLabel"
                      defaultValue={event?.meetingDetails?.slotLabel || ""}
                      className={inputClass}
                      placeholder="10:00 AM - 1:00 PM"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Parent Instructions</label>
                    <textarea
                      name="parentInstructions"
                      rows={3}
                      defaultValue={event?.meetingDetails?.parentInstructions || ""}
                      className={`${inputClass} resize-none`}
                      placeholder="Bring the report card and arrive 10 minutes early."
                    />
                  </div>
                </>
              )}

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 dark:border-zinc-700 dark:text-zinc-300 sm:col-span-2">
                <input
                  type="checkbox"
                  name="isHoliday"
                  value="true"
                  defaultChecked={event?.isHoliday || event?.type === "Holiday"}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Mark this event as a school holiday
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
