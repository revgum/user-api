import { User } from "@user-api/core/types";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { randomUUID } from "crypto";

export const mockUser = (obj?: User) => ({
  userId: obj?.userId || randomUUID(),
  dob: obj?.dob || "dob",
  name: obj?.name || "name",
  emails: obj?.emails || [randomUUID(), randomUUID(), randomUUID()],
});

export const mockRequest = (
  obj: any,
  id?: string
): APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2> => {
  const body = typeof obj === "string" ? obj : JSON.stringify(obj);
  return {
    body,
    requestContext: {
      apiId: "test-api-id",
      http: {
        path: "/test/api/path",
      },
      requestId: "test-request-id",
      stage: "test-stage",
    },
    pathParameters: {
      id: id ?? "test-id",
    },
  } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>;
};
