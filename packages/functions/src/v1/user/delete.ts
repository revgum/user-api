import { destroy } from "@user-api/core/entities/user";
import { errorResponse, payloadResponse } from "@user-api/core/lib/apiResponse";
import {
  authenticateUser,
  getServiceContext,
} from "@user-api/core/lib/context";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { constants } from "http2";

export async function main(
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>
) {
  const ctx = getServiceContext({ request });

  try {
    authenticateUser(ctx);

    await destroy(ctx.request.pathParameters!.id!);

    return payloadResponse(
      { message: "User deleted" },
      ctx,
      constants.HTTP_STATUS_NO_CONTENT
    );
  } catch (error) {
    return errorResponse(error as Error, ctx);
  }
}
