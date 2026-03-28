import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import CertificateTemplate from "@/models/CertificateTemplate";
import TemplateEditor from "../TemplateEditor";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  await connectDB();
  const template = await CertificateTemplate.findById(params.id).lean();

  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <TemplateEditor template={JSON.parse(JSON.stringify(template))} />
    </div>
  );
}
