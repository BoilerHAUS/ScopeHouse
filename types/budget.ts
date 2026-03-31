import type { EntityId } from "@/types/common";

export type BudgetLineStatus = "estimate" | "allowance" | "quote" | "actual";

export type BudgetLine = {
  id: EntityId;
  projectId: EntityId;
  label: string;
  amount: number;
  status: BudgetLineStatus;
};
