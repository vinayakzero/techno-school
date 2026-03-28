import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Award, BookOpen } from "lucide-react";
import mongoose from "mongoose";
import { formatShortDate } from "@/lib/date";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StudentResultsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  const student = await Student.findById(id).lean();
  if (!student) notFound();

  // Fetch all results for this student, populate Exam, and then deeply populate Subject
  const results = await Result.find({ student: id })
    .populate({
      path: "exam",
      model: Exam,
      populate: {
        path: "subject",
        model: Subject,
        select: "name code"
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  const getGradeFromPercentage = (percentage: number) => {
    if (percentage >= 90) return { letter: "A", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200" };
    if (percentage >= 80) return { letter: "B", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200" };
    if (percentage >= 70) return { letter: "C", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200" };
    if (percentage >= 60) return { letter: "D", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-200" };
    return { letter: "F", color: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200" };
  };

  // Calculate generic statistics
  let totalScore = 0;
  let totalMax = 0;
  results.forEach(r => {
    totalScore += r.marksObtained;
    totalMax += (r.exam as any).totalMarks;
  });
  const overallPercentage = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : 0;
  const overallGrade = getGradeFromPercentage(Number(overallPercentage));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 text-sm">
        <Link href={`/admin/students/${student._id}`} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back to Profile
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 absolute top-0 inset-x-0"></div>
        
        <div className="px-8 pb-8 pt-16 relative z-10 flex flex-col md:flex-row gap-6 md:items-end justify-between">
          <div className="flex items-end gap-6">
            <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-800 border-[6px] border-white dark:border-zinc-900 shadow-xl flex items-center justify-center shrink-0">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {student.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="pb-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{student.name}</h1>
              <p className="text-blue-100 dark:text-blue-200 font-medium tracking-wide drop-shadow-sm mt-1">Official Academic Record · {student.grade} Section {student.section}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-700 flex items-center gap-5 shrink-0 self-start md:self-auto translate-y-4 md:translate-y-0">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Cumulative GPA</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{overallPercentage}%</span>
                <span className="text-sm font-semibold text-gray-500">Overall</span>
              </div>
            </div>
            <div className={`h-12 w-12 rounded-xl border flex items-center justify-center text-2xl font-black font-mono shadow-inner ${overallGrade.color}`}>
              {overallGrade.letter}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            <Award className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exam Result History</h2>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/20">
            <BookOpen className="mx-auto text-gray-400 dark:text-zinc-600 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-300">No Grades Recorded</h3>
            <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">This student hasn't been graded for any exams currently on record.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result: any) => {
              const exam = result.exam as any;
              const subject = exam?.subject;
              const percentage = (result.marksObtained / exam.totalMarks) * 100;
              const grade = getGradeFromPercentage(percentage);

              return (
                <div key={result._id} className="group p-5 rounded-2xl border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-zinc-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exam?.name || "Unknown Exam"}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-600">
                        {formatShortDate(exam.date)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                      Subject: <span className="text-gray-900 dark:text-zinc-200">{subject?.name || "N/A"} ({subject?.code || "N/A"})</span>
                    </p>
                    {result.remarks && (
                      <p className="text-sm italic text-gray-500 dark:text-zinc-500 mt-2">"{result.remarks}"</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 min-w-[200px] justify-between shadow-inner shrink-0 w-full sm:w-auto">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-500 dark:text-zinc-500">Score</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {result.marksObtained} <span className="text-gray-400 text-sm">/ {exam.totalMarks}</span>
                      </span>
                    </div>
                    
                    <div className="h-10 w-px bg-gray-200 dark:bg-zinc-700"></div>

                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-500 dark:text-zinc-500">Grade</span>
                      <div className={`mt-1 h-8 w-8 rounded-lg border flex items-center justify-center text-lg font-black font-mono shadow-sm ${grade.color}`}>
                        {grade.letter}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
