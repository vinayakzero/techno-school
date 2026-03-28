"use server";

import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Result from "@/models/Result";
import { revalidatePath } from "next/cache";
import { deleteExamEvent, syncExamEvent } from "@/lib/calendar";

export async function addExamAction(formData: FormData) {
  try {
    await connectDB();
    
    // subject string holds both grade and id: "Grade|SubjectID" or we can pass them as separate hidden inputs
    // Assuming the form sends subjectId and grade separately:
    
    const subjectId = formData.get("subjectId")?.toString();
    const grade = formData.get("grade")?.toString();
    
    if (!subjectId || !grade) {
      return { success: false, error: "Subject ID and Grade are required." };
    }

    const data = {
      name: formData.get("name")?.toString(),
      subject: subjectId,
      grade: grade,
      date: formData.get("date")?.toString(),
      totalMarks: Number(formData.get("totalMarks")) || 100,
    };

    const newExam = await Exam.create(data);
    await syncExamEvent(newExam._id.toString());
    
    revalidatePath("/admin/exams");
    revalidatePath("/admin/calendar");
    return { success: true, exam: JSON.parse(JSON.stringify(newExam)) };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: "An exam with this name already exists for this subject on this date." };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteExamAction(id: string) {
  try {
    await connectDB();
    
    // Del exam
    await Exam.findByIdAndDelete(id);
    // Cascade delete results
    await Result.deleteMany({ exam: id });
    await deleteExamEvent(id);
    
    revalidatePath("/admin/exams");
    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitMarksAction(examId: string, marksData: { student: string, marksObtained: number, remarks: string }[]) {
  try {
    await connectDB();
    
    const maxMarks = (await Exam.findById(examId))?.totalMarks || 100;
    
    // Bulk write operations
    const bulkOps = marksData.map((data) => ({
      updateOne: {
        filter: { exam: examId, student: data.student },
        update: { 
          $set: { 
            marksObtained: Math.min(data.marksObtained, maxMarks), 
            remarks: data.remarks 
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Result.bulkWrite(bulkOps);
    }
    
    revalidatePath(`/admin/exams/${examId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
