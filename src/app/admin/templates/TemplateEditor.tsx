"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTemplateAction, updateTemplateAction } from "./actions";

const CATEGORIES = ["Certificate", "ID Card", "Receipt", "Report"];
const AUDIENCES = ["Student", "Teacher", "Parent", "School"];
const ORIENTATIONS = ["portrait", "landscape"];
const PAPER_SIZES = ["A4", "Letter", "ID-1"];

export default function TemplateEditor({
  template,
}: {
  template?: any;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const isEdit = !!template;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-zinc-300";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(formRef.current!);
    if (!formData.get("isActive")) {
      formData.set("isActive", "false");
    }

    const result = isEdit
      ? await updateTemplateAction(template._id, formData)
      : await createTemplateAction(formData);

    setSubmitting(false);

    if (result.success) {
      router.push("/admin/templates");
      router.refresh();
      return;
    }

    setError(result.error || "Unable to save template.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/templates"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Templates
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Template" : "Create Template"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Configure printable school formats with placeholder mapping and output settings.
          </p>
        </div>

        {isEdit && (
          <Link
            href={`/admin/templates/${template._id}/preview`}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Preview Template
          </Link>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Template Name *</label>
              <input
                name="name"
                required
                defaultValue={template?.name || ""}
                className={inputClass}
                placeholder="e.g. Bonafide Certificate"
              />
            </div>

            <div>
              <label className={labelClass}>Slug</label>
              <input
                name="slug"
                defaultValue={template?.slug || ""}
                className={inputClass}
                placeholder="auto-generated if left blank"
              />
            </div>

            <div>
              <label className={labelClass}>Audience *</label>
              <select name="audience" defaultValue={template?.audience || "Student"} className={inputClass}>
                {AUDIENCES.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select name="category" defaultValue={template?.category || "Certificate"} className={inputClass}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Paper Size *</label>
              <select name="paperSize" defaultValue={template?.paperSize || "A4"} className={inputClass}>
                {PAPER_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Orientation *</label>
              <select name="orientation" defaultValue={template?.orientation || "portrait"} className={inputClass}>
                {ORIENTATIONS.map((orientation) => (
                  <option key={orientation} value={orientation}>
                    {orientation}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={template?.description || ""}
                className={`${inputClass} resize-none`}
                placeholder="Describe when this print format should be used."
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Placeholder Keys</label>
              <textarea
                name="placeholders"
                rows={4}
                defaultValue={template?.placeholders?.join(", ") || ""}
                className={`${inputClass} resize-none`}
                placeholder="studentName, grade, section, issueDate"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                Use comma-separated keys. They will appear in previews like {"{{studentName}}"}.
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 dark:border-zinc-700 dark:text-zinc-300 md:col-span-2">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={template?.isActive ?? true}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Keep this template available for printing
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/admin/templates"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEdit ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
