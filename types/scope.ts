import type { EntityId } from "@/types/common";

export type ScopeItemStatus = "draft" | "active" | "needs_info";
export type ScopeItemSource = "manual" | "ai_draft";
export type ScopeDraftStatus = "pending_review" | "applied" | "discarded";
export type ScopeDraftItemStatus = "included" | "needs_info" | "optional";

export type ScopeDraftItem = {
  label: string;
  status: ScopeDraftItemStatus;
  notes: string | null;
};

export type ScopeDraftArea = {
  name: string;
  items: ScopeDraftItem[];
};

export type ScopeDraftPhase = {
  name: string;
  areas: ScopeDraftArea[];
};

export type ProjectScopeDraft = {
  id: EntityId;
  projectId: EntityId;
  projectSummary: string;
  phases: ScopeDraftPhase[];
  assumptions: string[];
  risks: string[];
  status: ScopeDraftStatus;
  createdAt: Date;
  appliedAt: Date | null;
};

export type ProjectScopeItem = {
  id: EntityId;
  projectId: EntityId;
  phaseName: string;
  phaseOrder: number;
  areaName: string;
  areaOrder: number;
  itemOrder: number;
  label: string;
  notes: string | null;
  status: ScopeItemStatus;
  source: ScopeItemSource;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectScopeGroup = {
  phaseName: string;
  phaseOrder: number;
  areas: Array<{
    areaName: string;
    areaOrder: number;
    items: ProjectScopeItem[];
  }>;
};
