import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Student from "@/models/Student";
import Result from "@/models/Result";
import { notFound } from "next/navigation";
import MarksEntryClient from "./MarksEntryClient";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MarksEntryPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  // 1. Fetch Exam and deeply populate the Subject string name
  const exam = await Exam.findById(id).populate("subject", "name").lean();
  if (!exam) notFound();

  // 2. Fetch all Active Students matching the precise Grade the exam focuses on
  const targetGrade = (exam as any).grade;
  const students = await Student.find({ grade: targetGrade, status: "Active" }).select("name email _id").sort({ name: 1 }).lean();

  // 3. Fetch any existing results for this precise Exam mapped against these students
  const results = await Result.find({ exam: id }).select("student marksObtained remarks").lean();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <MarksEntryClient 
        exam={JSON.parse(JSON.stringify(exam))}
        students={JSON.parse(JSON.stringify(students))}
        results={JSON.parse(JSON.stringify(results))}
      />
    </div>
  );
}
