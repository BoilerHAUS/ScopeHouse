export type EntityId = string;
export type IsoDateString = string;

export type RecordStatus = "draft" | "active" | "archived";

export type AuthenticatedUser = {
  id: EntityId;
  email: string;
  name: string | null;
};
