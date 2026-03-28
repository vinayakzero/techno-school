"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteTemplateAction } from "./actions";

type TemplateRecord = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  audience: string;
  description?: string;
  placeholders: string[];
  orientation: string;
  paperSize: string;
  isActive: boolean;
};

export default function TemplateListClient({ templates }: { templates: TemplateRecord[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesQuery =
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.slug.toLowerCase().includes(query.toLowerCase()) ||
        template.audience.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || template.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [templates, query, category]);

  const categorySummary = useMemo(() => {
    return {
      total: templates.length,
      certificates: templates.filter((template) => template.category === "Certificate").length,
      reports: templates.filter((template) => template.category === "Report").length,
      cards: templates.filter((template) => template.category === "ID Card").length,
      receipts: templates.filter((template) => template.category === "Receipt").length,
    };
  }, [templates]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) {
      return;
    }

    const result = await deleteTemplateAction(id);
    if (result.success) {
      router.refresh();
    } else if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates & Printouts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage school certificates, report formats, ID cards, and printable records.
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          New Template
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Templates" value={categorySummary.total.toString()} accent="blue" />
        <SummaryCard label="Certificates" value={categorySummary.certificates.toString()} accent="emerald" />
        <SummaryCard label="Reports" value={categorySummary.reports.toString()} accent="amber" />
        <SummaryCard label="ID / Receipt" value={(categorySummary.cards + categorySummary.receipts).toString()} accent="violet" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-[1.5fr,0.7fr]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Search by name, slug, or audience"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {["All", "Certificate", "Report", "ID Card", "Receipt"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredTemplates.map((template) => (
          <article
            key={template._id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{template.name}</h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {template.category}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {template.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  `{template.slug}` - {template.audience} - {template.paperSize} - {template.orientation}
                </p>

                <p className="text-sm text-gray-600 dark:text-zinc-300">
                  {template.description || "No template description added yet."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {template.placeholders.length > 0 ? (
                    template.placeholders.map((placeholder) => (
                      <span
                        key={placeholder}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {`{{${placeholder}}}`}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                      No placeholders configured
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/templates/${template._id}/preview`}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Eye size={15} />
                  Preview
                </Link>
                <Link
                  href={`/admin/templates/${template._id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/10"
                >
                  <Pencil size={15} />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(template._id, template.name)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <Printer className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600" />
          <p className="mt-4 text-base font-semibold text-gray-900 dark:text-zinc-100">No templates matched this filter</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Try another search or create a new printable format for certificates and reports.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: "blue" | "emerald" | "amber" | "violet" }) {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${accentClasses[accent]}`}>
        {label}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
