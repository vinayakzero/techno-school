import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import ExamsClient from "./ExamsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExamsPage() {
  await connectDB();
  const exams = await Exam.find()
    .populate("subject", "name code")
    .sort({ date: -1, name: 1 })
    .lean();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <ExamsClient exams={JSON.parse(JSON.stringify(exams))} subjects={[]} />
    </div>
  );
}
