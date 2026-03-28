"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Flag, Pencil, Plus, Trash2, Users, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import EventForm from "./EventForm";
import { deleteEventAction } from "./actions";

function getTypeClasses(type: string, isHoliday: boolean) {
  if (isHoliday) return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
  if (type === "Exam") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  if (type === "Meeting") return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
  if (type === "Deadline") return "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
}

export default function CalendarClient({ events, teachers }: { events: any[]; teachers: any[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    if (events.length > 0) return new Date(events[0].startDate);
    return new Date();
  });

  const groupedEvents = useMemo(() => {
    const map = new Map<string, any[]>();
    events.forEach((event) => {
      const key = new Date(event.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const current = map.get(key) || [];
      current.push(event);
      map.set(key, current);
    });
    return Array.from(map.entries());
  }, [events]);

  const summary = useMemo(() => {
    const holidays = events.filter((event) => event.isHoliday).length;
    const meetings = events.filter((event) => event.type === "Meeting").length;
    const exams = events.filter((event) => event.type === "Exam").length;
    const parentMeetings = events.filter((event) => event.type === "Meeting" && event.audience === "Parents").length;
    return { total: events.length, holidays, meetings, exams, parentMeetings };
  }, [events]);

  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const startWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const monthTitle = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    events.forEach((event) => {
      let cursor = new Date(event.startDate);
      const end = new Date(event.endDate);
      while (cursor <= end) {
        const key = cursor.toISOString().split("T")[0];
        const current = map.get(key) || [];
        current.push(event);
        map.set(key, current);
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}" from the calendar?`)) {
      await deleteEventAction(id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar & Events</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Plan holidays, exam windows, meetings, and school activities in one place.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <ChevronLeft size={16} />
          </button>
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{monthTitle}</span>
          <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("list")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${viewMode === "list" ? "bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
            <LayoutList size={16} />
            List View
          </button>
          <button onClick={() => setViewMode("calendar")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${viewMode === "calendar" ? "bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
            <CalendarDays size={16} />
            Calendar View
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<CalendarDays className="h-5 w-5 text-blue-600" />} label="Total Events" value={summary.total.toString()} />
        <SummaryCard icon={<Flag className="h-5 w-5 text-red-600" />} label="Holidays" value={summary.holidays.toString()} />
        <SummaryCard icon={<Users className="h-5 w-5 text-violet-600" />} label="Meetings" value={summary.meetings.toString()} />
        <SummaryCard icon={<CalendarDays className="h-5 w-5 text-amber-600" />} label="Exam Events" value={summary.exams.toString()} />
        <SummaryCard icon={<Users className="h-5 w-5 text-blue-600" />} label="Parent Meetings" value={summary.parentMeetings.toString()} />
      </div>

      <div className="space-y-6">
        {groupedEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-base font-semibold text-gray-900 dark:text-zinc-100">No calendar events yet</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Add holidays, meetings, and exam plans to start building the school calendar.
            </p>
          </div>
        ) : viewMode === "calendar" ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: startWeekday }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-[120px] rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 dark:border-zinc-800 dark:bg-zinc-950/40" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const dayDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), dayNumber);
                const dayKey = dayDate.toISOString().split("T")[0];
                const dayEvents = eventsByDate.get(dayKey) || [];

                return (
                  <div key={dayKey} className={`min-h-[120px] rounded-2xl border p-3 ${dayEvents.length > 0 ? "border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/10" : "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{dayNumber}</span>
                      {dayEvents.some((event) => event.isHoliday) && <Flag size={14} className="text-red-500" />}
                    </div>
                    <div className="mt-3 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div key={`${dayKey}-${event._id}`} className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${getTypeClasses(event.type, event.isHoliday)}`}>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          groupedEvents.map(([monthLabel, monthEvents]) => (
            <section key={monthLabel} className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{monthLabel}</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {monthEvents.map((event) => (
                  <div key={event._id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">{event.title}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTypeClasses(event.type, event.isHoliday)}`}>
                          {event.isHoliday ? "Holiday" : event.type}
                        </span>
                        {event.grade && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {event.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" "}
                        to
                        {" "}
                        {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}
                        {event.audience}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-zinc-300">
                        {event.description || "No additional event notes."}
                      </p>
                      {event.type === "Meeting" && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm dark:border-blue-500/20 dark:bg-blue-500/10">
                          <p className="font-semibold text-blue-800 dark:text-blue-200">
                            {(event.meetingDetails?.hostTeacher as any)?.name || "Teacher to be assigned"}
                          </p>
                          <p className="mt-1 text-blue-700/90 dark:text-blue-300/90">
                            {event.meetingDetails?.meetingMode || "In Person"}
                            {event.meetingDetails?.slotLabel ? ` • ${event.meetingDetails.slotLabel}` : ""}
                          </p>
                          {event.meetingDetails?.venue && (
                            <p className="mt-1 text-blue-700/80 dark:text-blue-300/80">
                              Venue: {event.meetingDetails.venue}
                            </p>
                          )}
                          {event.meetingDetails?.parentInstructions && (
                            <p className="mt-2 text-xs text-blue-700/80 dark:text-blue-300/80">
                              {event.meetingDetails.parentInstructions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowForm(true);
                        }}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        title="Edit event"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id, event.title)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          teachers={teachers}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
