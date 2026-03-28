import FeeStructure from "@/models/FeeStructure";
import Payment from "@/models/Payment";
import Student from "@/models/Student";

type StudentFeeSnapshot = {
  _id: string;
  grade: string;
  fees?: {
    total?: number;
    paid?: number;
    pending?: number;
  };
};

export async function calculateStudentFeeSummary(student: StudentFeeSnapshot) {
  const [structures, payments] = await Promise.all([
    FeeStructure.find({ grade: student.grade, isActive: true }).lean(),
    Payment.find({ studentId: student._id }).lean(),
  ]);

  const structureTotal = structures.reduce((sum, item: any) => sum + (item.amount || 0), 0);
  const paymentTotal = payments.reduce((sum, item: any) => sum + (item.amount || 0), 0);
  const hasStructures = structures.length > 0;

  const total = hasStructures ? structureTotal : student.fees?.total || 0;
  const paid = paymentTotal > 0 ? paymentTotal : student.fees?.paid || 0;
  const pending = Math.max(total - paid, 0);

  return { total, paid, pending };
}

export async function syncStudentFeeSummary(studentId: string) {
  const student = await Student.findById(studentId).select("grade fees").lean<StudentFeeSnapshot | null>();
  if (!student) return null;

  const fees = await calculateStudentFeeSummary({
    _id: student._id.toString(),
    grade: student.grade,
    fees: student.fees,
  });

  await Student.findByIdAndUpdate(studentId, { $set: { fees } });
  return fees;
}

export async function syncGradeFeeSummaries(grade: string) {
  const students = await Student.find({ grade }).select("grade fees").lean<StudentFeeSnapshot[]>();

  await Promise.all(
    students.map(async (student) => {
      const fees = await calculateStudentFeeSummary({
        _id: student._id.toString(),
        grade: student.grade,
        fees: student.fees,
      });

      await Student.findByIdAndUpdate(student._id, { $set: { fees } });
    })
  );
}

export function generateReceiptNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RCPT-${datePart}-${randomPart}`;
}
