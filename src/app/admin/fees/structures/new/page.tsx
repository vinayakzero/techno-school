import FeeStructureForm from "../../FeeStructureForm";

export const dynamic = "force-dynamic";

export default function NewFeeStructurePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <FeeStructureForm />
    </div>
  );
}
