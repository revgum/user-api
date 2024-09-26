import { get } from "@user-api/core/entities/user";
import { errorResponse, payloadResponse } from "@user-api/core/lib/apiResponse";
import { getServiceContext } from "@user-api/core/lib/context";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";

export async function main(
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>
) {
  const ctx = getServiceContext({ request });

  try {
    const user = await get(ctx.request.pathParameters!.id!);

    return payloadResponse({ user }, ctx);
  } catch (error) {
    return errorResponse(error as Error, ctx);
  }
}
