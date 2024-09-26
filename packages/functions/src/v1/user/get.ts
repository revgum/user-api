import { get } from "@user-api/core/entities/user";
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
    const user = await get(pathParameters!.id!);

    return payloadResponse({ user }, requestContext);
  } catch (error) {
    return errorResponse(error as Error, requestContext);
  }
}
