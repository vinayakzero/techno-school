import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import Teacher from "@/models/Teacher";
import CalendarClient from "./CalendarClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CalendarPage() {
  await connectDB();
  const [events, teachers] = await Promise.all([
    Event.find()
      .populate("meetingDetails.hostTeacher", "name subject")
      .sort({ startDate: 1, endDate: 1, createdAt: -1 })
      .lean(),
    Teacher.find({ status: { $in: ["Active", "On Leave"] } }).select("name subject _id").sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <CalendarClient
        events={JSON.parse(JSON.stringify(events))}
        teachers={JSON.parse(JSON.stringify(teachers))}
      />
    </div>
  );
}
