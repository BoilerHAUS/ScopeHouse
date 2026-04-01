"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteProjectDocumentAction } from "@/features/documents/actions/delete-project-document";
import { uploadProjectDocumentAction } from "@/features/documents/actions/upload-project-document";
import type { listProjectDocumentsForUser } from "@/features/documents/queries/list-project-documents";
import type { DocumentUploadActionState } from "@/features/documents/schemas/document-upload-form";

type ProjectDocumentsData = NonNullable<
  Awaited<ReturnType<typeof listProjectDocumentsForUser>>
>;

const initialState: DocumentUploadActionState = {};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (sizeBytes >= 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${sizeBytes} B`;
}

export function DocumentVault({
  projectId,
  documents,
}: {
  projectId: string;
  documents: ProjectDocumentsData;
}) {
  const [state, formAction, pending] = useActionState(
    uploadProjectDocumentAction.bind(null, projectId),
    initialState,
  );
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Documents
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Document vault
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Upload proposals, quotes, plans, and other project files with light tagging
          so retrieval stays useful instead of becoming a dump.
        </p>
      </section>

      <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Document file</span>
              <input
                type="file"
                name="file"
                accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                required
              />
              {state.fieldErrors?.file ? (
                <p className="text-destructive text-sm">{state.fieldErrors.file}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Tags</span>
              <input
                type="text"
                name="tags"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                placeholder="quote, cabinetry, design"
              />
              {state.fieldErrors?.tags ? (
                <p className="text-destructive text-sm">{state.fieldErrors.tags}</p>
              ) : null}
            </label>
          </div>

          {state.error ? (
            <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" className="rounded-full px-4" disabled={pending}>
            {pending ? "Uploading..." : "Upload document"}
          </Button>
        </form>
      </section>

      {documents.length === 0 ? (
        <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-8 text-center shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-lg font-semibold">No project documents yet.</p>
          <p className="text-muted mx-auto mt-3 max-w-2xl text-sm leading-7">
            Start with quotes, sketches, or planning notes that should stay attached
            to this renovation record.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border-border bg-surface rounded-[1.5rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold">{document.originalName}</p>
                  <p className="text-muted mt-2 text-sm leading-7">
                    Uploaded by {document.createdBy.name ?? document.createdBy.email} on{" "}
                    {new Date(document.createdAt).toLocaleString()}
                  </p>
                  <p className="text-muted text-sm">
                    {document.contentType} · {formatFileSize(document.sizeBytes)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button asChild variant="outline" className="rounded-full px-4">
                    <Link href={`/projects/${projectId}/documents/${document.id}`} target="_blank">
                      Open file
                    </Link>
                  </Button>
                  {confirmingId === document.id ? (
                    <form action={deleteProjectDocumentAction.bind(null, projectId)}>
                      <input type="hidden" name="documentId" value={document.id} />
                      <div className="flex items-center gap-2">
                        <Button
                          type="submit"
                          variant="destructive"
                          className="rounded-full px-4"
                        >
                          Confirm remove
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full px-4"
                          onClick={() => setConfirmingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full px-4"
                      onClick={() => setConfirmingId(document.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {document.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={`${document.id}-${tag}`}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
