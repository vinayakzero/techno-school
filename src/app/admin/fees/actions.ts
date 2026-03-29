"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import FeeStructure from "@/models/FeeStructure";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import { generateReceiptNumber, syncGradeFeeSummaries, syncStudentFeeSummary } from "@/lib/fees";

export async function addFeeStructureAction(formData: FormData) {
  try {
    await connectDB();

    const data = {
      title: formData.get("title")?.toString() || "",
      grade: formData.get("grade")?.toString() || "",
      amount: Number(formData.get("amount")) || 0,
      dueDate: new Date(formData.get("dueDate")?.toString() || new Date().toISOString()),
      category: formData.get("category")?.toString() || "Tuition",
      description: formData.get("description")?.toString() || "",
      lateFeeAmount: Number(formData.get("lateFeeAmount")) || 0,
      installmentAllowed: formData.get("installmentAllowed")?.toString() === "true",
      installmentCount: Math.max(Number(formData.get("installmentCount")) || 1, 1),
      isActive: formData.get("isActive")?.toString() === "true",
    };

    await FeeStructure.create(data);
    await syncGradeFeeSummaries(data.grade);

    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: "A fee structure with this title already exists for the selected grade." };
    }
    return { success: false, error: error.message };
  }
}

export async function updateFeeStructureAction(id: string, formData: FormData) {
  try {
    await connectDB();

    const existing = await FeeStructure.findById(id).lean();
    if (!existing) {
      return { success: false, error: "Fee structure not found." };
    }

    const data = {
      title: formData.get("title")?.toString() || "",
      grade: formData.get("grade")?.toString() || "",
      amount: Number(formData.get("amount")) || 0,
      dueDate: new Date(formData.get("dueDate")?.toString() || new Date().toISOString()),
      category: formData.get("category")?.toString() || "Tuition",
      description: formData.get("description")?.toString() || "",
      lateFeeAmount: Number(formData.get("lateFeeAmount")) || 0,
      installmentAllowed: formData.get("installmentAllowed")?.toString() === "true",
      installmentCount: Math.max(Number(formData.get("installmentCount")) || 1, 1),
      isActive: formData.get("isActive")?.toString() === "true",
    };

    await FeeStructure.findByIdAndUpdate(id, { $set: data }, { runValidators: true });
    await Promise.all([
      syncGradeFeeSummaries(existing.grade),
      existing.grade !== data.grade ? syncGradeFeeSummaries(data.grade) : Promise.resolve(),
    ]);

    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: "A fee structure with this title already exists for the selected grade." };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteFeeStructureAction(id: string) {
  try {
    await connectDB();

    const structure = await FeeStructure.findById(id).lean();
    if (!structure) {
      return { success: false, error: "Fee structure not found." };
    }

    await FeeStructure.findByIdAndDelete(id);
    await syncGradeFeeSummaries(structure.grade);

    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordPaymentAction(formData: FormData) {
  try {
    await connectDB();

    const studentId = formData.get("studentId")?.toString() || "";
    const student = await Student.findById(studentId).select("grade").lean();

    if (!student) {
      return { success: false, error: "Student not found." };
    }

    const receiptNo = formData.get("receiptNo")?.toString()?.trim() || generateReceiptNumber();
    const amountReceived = Number(formData.get("amount")) || 0;
    const fineAmount = Number(formData.get("fineAmount")) || 0;
    const waiverAmount = Number(formData.get("waiverAmount")) || 0;
    const baseAmount = Math.max(amountReceived - fineAmount, 0);

    if (amountReceived <= 0 && waiverAmount <= 0) {
      return { success: false, error: "Enter a payment amount or waiver amount." };
    }

    if (fineAmount > amountReceived) {
      return { success: false, error: "Late fee cannot exceed the collected amount." };
    }

    const payment = await Payment.create({
      studentId,
      feeStructureId: formData.get("feeStructureId")?.toString() || null,
      grade: student.grade,
      amount: amountReceived,
      baseAmount,
      fineAmount,
      waiverAmount,
      date: new Date(formData.get("date")?.toString() || new Date().toISOString()),
      mode: formData.get("mode")?.toString() || "Cash",
      receiptNo,
      installmentLabel: formData.get("installmentLabel")?.toString() || "",
      collectedBy: formData.get("collectedBy")?.toString() || "",
      status: "Posted",
      notes: formData.get("notes")?.toString() || "",
    });

    await syncStudentFeeSummary(studentId);

    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    revalidatePath("/admin/fees/daily-collection");
    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/admin/fees/receipts/${payment._id.toString()}`);

    return { success: true, paymentId: payment._id.toString(), receiptNo };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: "Receipt number already exists. Please use a different one." };
    }
    return { success: false, error: error.message };
  }
}

export async function deletePaymentAction(id: string) {
  try {
    await connectDB();

    const payment = await Payment.findById(id).lean();
    if (!payment) {
      return { success: false, error: "Payment not found." };
    }

    await Payment.findByIdAndDelete(id);
    await syncStudentFeeSummary(payment.studentId.toString());

    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    revalidatePath("/admin/fees/daily-collection");
    revalidatePath(`/admin/students/${payment.studentId.toString()}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
