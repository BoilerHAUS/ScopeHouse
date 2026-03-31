import type { EntityId, IsoDateString } from "@/types/common";

export type ProjectDocument = {
  id: EntityId;
  projectId: EntityId;
  name: string;
  uploadedAt: IsoDateString;
  contentType: string;
};
