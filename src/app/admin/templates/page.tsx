import connectDB from "@/lib/mongodb";
import CertificateTemplate from "@/models/CertificateTemplate";
import TemplateListClient from "./TemplateListClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TemplatesPage() {
  await connectDB();
  const templates = await CertificateTemplate.find().sort({ category: 1, name: 1 }).lean();

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <TemplateListClient templates={JSON.parse(JSON.stringify(templates))} />
    </div>
  );
}
