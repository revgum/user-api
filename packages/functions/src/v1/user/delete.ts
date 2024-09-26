import { destroy } from "@user-api/core/entities/user";
import { errorResponse, payloadResponse } from "@user-api/core/lib/apiResponse";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";

export async function main({
  pathParameters,
  requestContext,
}: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>) {
  try {
    await destroy(pathParameters!.id!);

    return payloadResponse(
      {
        message: "User deleted",
      },
      requestContext
    );
  } catch (error) {
    return errorResponse(error as Error, requestContext);
  }
}
