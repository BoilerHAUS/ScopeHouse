import type { EntityId } from "@/types/common";

export type BudgetCategoryStatus = "draft" | "active";

export type BudgetCategory = {
  id: EntityId;
  projectId: EntityId;
  label: string;
  notes: string | null;
  status: BudgetCategoryStatus;
  itemOrder: number;
};

export type BudgetLine = {
  id: EntityId;
  projectId: EntityId;
  categoryId: EntityId;
  scopeItemId: EntityId | null;
  label: string;
  estimateCents: number | null;
  allowanceCents: number | null;
  quotedCents: number | null;
  actualCents: number | null;
  sourceReference: string | null;
  notes: string | null;
  itemOrder: number;
};

export type BudgetLineRollup = {
  estimateCents: number;
  allowanceCents: number;
  quotedCents: number;
  actualCents: number;
  planningCents: number;
};
