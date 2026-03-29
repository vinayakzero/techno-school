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
    waived?: number;
    fine?: number;
    collected?: number;
  };
};

export async function calculateStudentFeeSummary(student: StudentFeeSnapshot) {
  const [structures, payments] = await Promise.all([
    FeeStructure.find({ grade: student.grade, isActive: true }).lean(),
    Payment.find({ studentId: student._id, status: { $ne: "Cancelled" } }).lean(),
  ]);

  const structureTotal = structures.reduce((sum, item: any) => sum + (item.amount || 0), 0);
  const paidTowardFees = payments.reduce(
    (sum, item: any) => sum + (item.baseAmount ?? item.amount ?? 0) + (item.waiverAmount || 0),
    0
  );
  const totalWaived = payments.reduce((sum, item: any) => sum + (item.waiverAmount || 0), 0);
  const totalFine = payments.reduce((sum, item: any) => sum + (item.fineAmount || 0), 0);
  const totalCollected = payments.reduce((sum, item: any) => sum + (item.amount || 0), 0);
  const hasStructures = structures.length > 0;

  const total = hasStructures ? structureTotal : student.fees?.total || 0;
  const paid = paidTowardFees > 0 ? paidTowardFees : student.fees?.paid || 0;
  const pending = Math.max(total - paid, 0);
  const waived = totalWaived > 0 ? totalWaived : student.fees?.waived || 0;
  const fine = totalFine > 0 ? totalFine : student.fees?.fine || 0;
  const collected = totalCollected > 0 ? totalCollected : student.fees?.collected || 0;

  return { total, paid, pending, waived, fine, collected };
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
