import type { EntityId, IsoDateString } from "@/types/common";

export type ProjectDocument = {
  id: EntityId;
  projectId: EntityId;
  createdById: EntityId;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  tags: string[];
  createdAt: IsoDateString;
};

export type ProjectPhoto = {
  id: EntityId;
  projectId: EntityId;
  createdById: EntityId;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  caption: string | null;
  roomTag: string | null;
  phaseTag: string | null;
  takenOn: string | null;
  uploadedAt: IsoDateString;
};
