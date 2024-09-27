import { User } from "@user-api/core/types";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { randomUUID } from "crypto";

export const mockUser = (obj?: User) => ({
  userId: obj?.userId || randomUUID(),
  dob: obj?.dob || "1902-02-01",
  name: obj?.name || "name",
  emails: obj?.emails || ["email@example.com"],
});

export const mockRequest = (
  obj: any,
  id?: string
): APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2> => {
  const body = typeof obj === "string" ? obj : JSON.stringify(obj);
  return {
    body,
    headers: {
      authorization: "Bearer test-api-key",
    },
    requestContext: {
      apiId: "test-api-id",
      http: {
        method: "GET",
      },
      routeKey: "GET /test/route/{id}",
      requestId: "test-request-id",
      stage: "test-stage",
    },
    pathParameters: {
      id: id ?? "test-id",
    },
  } as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>;
};
