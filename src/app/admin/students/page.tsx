import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import StudentsClient from "./StudentsClient";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  await connectDB();
  const students = await Student.find().sort({ createdAt: -1 }).lean();
  return <StudentsClient students={JSON.parse(JSON.stringify(students))} />;
}
