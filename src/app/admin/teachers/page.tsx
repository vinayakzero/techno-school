import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import TeachersClient from "./TeachersClient";

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  await connectDB();
  const teachers = await Teacher.find().sort({ createdAt: -1 }).lean();
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <TeachersClient teachers={JSON.parse(JSON.stringify(teachers))} />
    </div>
  );
}
