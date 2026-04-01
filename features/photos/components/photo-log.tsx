"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { uploadProjectPhotoAction } from "@/features/photos/actions/upload-project-photo";
import type { listProjectPhotosForUser } from "@/features/photos/queries/list-project-photos";
import type { PhotoUploadActionState } from "@/features/photos/schemas/photo-upload-form";

type ProjectPhotosData = NonNullable<
  Awaited<ReturnType<typeof listProjectPhotosForUser>>
>;

const initialState: PhotoUploadActionState = {};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (sizeBytes >= 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${sizeBytes} B`;
}

export function PhotoLog({
  projectId,
  photos,
}: {
  projectId: string;
  photos: ProjectPhotosData;
}) {
  const [state, formAction, pending] = useActionState(
    uploadProjectPhotoAction.bind(null, projectId),
    initialState,
  );

  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Photos
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Project photo log
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Keep image evidence separate from generic documents so room context,
          phase context, and timing stay visible.
        </p>
      </section>

      <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Photo file</span>
              <input
                type="file"
                name="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                required
              />
              {state.fieldErrors?.file ? (
                <p className="text-destructive text-sm">{state.fieldErrors.file}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Caption</span>
              <input
                type="text"
                name="caption"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                placeholder="Existing cabinet wall before demolition"
              />
              {state.fieldErrors?.caption ? (
                <p className="text-destructive text-sm">{state.fieldErrors.caption}</p>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Room tag</span>
              <input
                type="text"
                name="roomTag"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                placeholder="Kitchen"
              />
              {state.fieldErrors?.roomTag ? (
                <p className="text-destructive text-sm">{state.fieldErrors.roomTag}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Phase tag</span>
              <input
                type="text"
                name="phaseTag"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                placeholder="Existing conditions"
              />
              {state.fieldErrors?.phaseTag ? (
                <p className="text-destructive text-sm">{state.fieldErrors.phaseTag}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Photo date</span>
              <input
                type="date"
                name="takenOn"
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              />
              {state.fieldErrors?.takenOn ? (
                <p className="text-destructive text-sm">{state.fieldErrors.takenOn}</p>
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
            {pending ? "Uploading..." : "Upload photo"}
          </Button>
        </form>
      </section>

      {photos.length === 0 ? (
        <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-8 text-center shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-lg font-semibold">No project photos yet.</p>
          <p className="text-muted mx-auto mt-3 max-w-2xl text-sm leading-7">
            Add existing-condition shots, site notes, or progress images with room
            and phase context.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="border-border bg-surface overflow-hidden rounded-[1.5rem] border shadow-[0_16px_40px_rgba(54,42,20,0.05)]"
            >
              <Link href={`/projects/${projectId}/photos/${photo.id}`} target="_blank">
                  <div className="relative aspect-[4/3] bg-stone-100">
                  <Image
                    src={`/projects/${projectId}/photos/${photo.id}`}
                    alt={photo.caption ?? photo.originalName}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="space-y-3 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">
                      {photo.caption ?? photo.originalName}
                    </p>
                    <p className="text-muted mt-2 text-sm">
                      Uploaded by {photo.createdBy.name ?? photo.createdBy.email}
                    </p>
                  </div>
                  <div className="text-right text-sm text-stone-600">
                    <p>{new Date(photo.uploadedAt).toLocaleDateString()}</p>
                    <p>{formatFileSize(photo.sizeBytes)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {photo.roomTag ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-700">
                      {photo.roomTag}
                    </span>
                  ) : null}
                  {photo.phaseTag ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-700">
                      {photo.phaseTag}
                    </span>
                  ) : null}
                  {photo.takenOn ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-700">
                      {photo.takenOn}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
