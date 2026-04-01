import path from "node:path";

const DOCUMENT_CONTENT_TYPES = new Map<string, string>([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [
    ".docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  [".txt", "text/plain"],
  [".csv", "text/csv"],
  [".xls", "application/vnd.ms-excel"],
  [
    ".xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
]);

const PHOTO_CONTENT_TYPES = new Map<string, string>([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

function inferFromExtension(fileName: string, allowedTypes: Map<string, string>) {
  return allowedTypes.get(path.extname(fileName).toLowerCase()) ?? null;
}

export function getDocumentContentType(fileName: string, providedType?: string | null) {
  const inferred = inferFromExtension(fileName, DOCUMENT_CONTENT_TYPES);

  if (providedType && [...DOCUMENT_CONTENT_TYPES.values()].includes(providedType)) {
    return providedType;
  }

  return inferred;
}

export function getPhotoContentType(fileName: string, providedType?: string | null) {
  const inferred = inferFromExtension(fileName, PHOTO_CONTENT_TYPES);

  if (providedType && [...PHOTO_CONTENT_TYPES.values()].includes(providedType)) {
    return providedType;
  }

  return inferred;
}
