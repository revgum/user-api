import { get, update } from "@user-api/core/entities/user";
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
import { UpdateUserRequestSchema } from "./validation/schemas";

export async function main(
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>
) {
  const ctx = getServiceContext({ request });

  try {
    authenticateUser(ctx);

    const id = ctx.request.pathParameters!.id!;
    const payload = parseRequestBody(ctx.request.body);

    const { error, data } = UpdateUserRequestSchema.safeParse(payload);
    if (error) {
      throw ServiceError.fromZodError(
        {
          detail: "Update user payload failed to parse",
          errorCode: "api.validation.failed",
          statusCode: constants.HTTP_STATUS_BAD_REQUEST,
          title: "Update user failed",
        },
        error
      );
    } else if (!data) {
      throw new ServiceError({
        detail: "Update user payload invalid",
        errorCode: "api.validation.invalid",
        statusCode: constants.HTTP_STATUS_BAD_REQUEST,
        title: "Update user invalid",
      });
    }
    const user = await get(id);
    const updatedUser = await update({ ...data, userId: user.userId });

    return payloadResponse({ user: updatedUser }, ctx);
  } catch (error) {
    return errorResponse(error as Error, ctx);
  }
}
