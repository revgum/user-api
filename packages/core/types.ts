export const ServiceErrorCodes = [
  "general.error",
  "entity.parsing.failed",
  "entity.validation.failed",
  "entity.invalid",
  "entity.not-found",
  "entity.action.failed",
  "api.validation.failed",
  "api.validation.invalid",
  "api.request.missing",
  "api.request.invalid",
] as const;

export type ServiceErrorCode = (typeof ServiceErrorCodes)[number];

export type ApiResponseMeta = {
  version: string;
  requestId?: string;
};

export type UserData = {
  emails: Set<string>;
  userId: string;
  name?: string;
  dob?: string;
  created: string;
  modified: string;
};

export interface User extends Omit<UserData, "pk" | "sk" | "emails"> {
  emails: string[];
}
