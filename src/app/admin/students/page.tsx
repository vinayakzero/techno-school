import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import StudentsClient from "./StudentsClient";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  await connectDB();
  const students = await Student.find().sort({ createdAt: -1 }).lean();
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <StudentsClient students={JSON.parse(JSON.stringify(students))} />
    </div>
  );
}
