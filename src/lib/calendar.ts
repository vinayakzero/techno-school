import Event from "@/models/Event";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";

void Subject;

export async function syncExamEvent(examId: string) {
  const exam = await Exam.findById(examId).populate("subject", "name code").lean();
  if (!exam) return null;

  const subject = exam.subject as any;
  const title = `${exam.name}`;
  const description = subject
    ? `${subject.name} (${subject.code}) exam scheduled for ${exam.grade}.`
    : `Exam scheduled for ${exam.grade}.`;

  return Event.findOneAndUpdate(
    { linkedExam: exam._id },
    {
      $set: {
        title,
        type: "Exam",
        startDate: exam.date,
        endDate: exam.date,
        audience: "Students",
        grade: exam.grade,
        description,
        isHoliday: false,
        linkedExam: exam._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function deleteExamEvent(examId: string) {
  await Event.deleteOne({ linkedExam: examId });
}
