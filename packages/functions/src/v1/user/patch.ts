import { get, patch } from "@user-api/core/entities/user";
import { parseRequestBody } from "@user-api/core/lib/apiRequest";
import { errorResponse, payloadResponse } from "@user-api/core/lib/apiResponse";
import {
  authenticateUser,
  getServiceContext,
} from "@user-api/core/lib/context";
import { ServiceError } from "@user-api/core/lib/serviceError";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { constants } from "http2";
import { PatchUserRequestSchema } from "./validation/schemas";

export async function main(
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>
) {
  const ctx = getServiceContext({ request });

  try {
    authenticateUser(ctx);

    const id = ctx.request.pathParameters!.id!;
    const payload = parseRequestBody(ctx.request.body);

    const { error, data } = PatchUserRequestSchema.safeParse(payload);
    if (error) {
      throw ServiceError.fromZodError(
        {
          detail: "Patch user payload failed to parse",
          errorCode: "api.validation.failed",
          statusCode: constants.HTTP_STATUS_BAD_REQUEST,
          title: "Patch user failed",
        },
        error
      );
    } else if (!data) {
      throw new ServiceError({
        detail: "Patch user payload invalid",
        errorCode: "api.validation.invalid",
        statusCode: constants.HTTP_STATUS_BAD_REQUEST,
        title: "Patch user invalid",
      });
    }
    const user = await get(id);
    const patchedUser = await patch(data, user.userId);

    return payloadResponse({ user: patchedUser }, ctx);
  } catch (error) {
    return errorResponse(error as Error, ctx);
  }
}
