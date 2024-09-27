import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";

export const ServiceErrorCodes = [
  "api.authentication.failed",
  "api.authorization.missing",
  "api.request.invalid",
  "api.request.missing",
  "api.validation.failed",
  "api.validation.invalid",
  "entity.action.failed",
  "entity.condition-check.failed",
  "entity.invalid",
  "entity.not-found",
  "entity.parsing.failed",
  "entity.validation.failed",
  "general.error",
] as const;

export type ServiceErrorCode = (typeof ServiceErrorCodes)[number];

export type ServiceContext = {
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>;
  cloudWatch: CloudWatchClient;
  documentClient: DynamoDBDocumentClient;
  startTime: number;
  session?: { isLoggedIn: boolean; userId: string };
};

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
