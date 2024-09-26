import { put } from "@user-api/core/entities/user";
import { parseRequestBody } from "@user-api/core/lib/apiRequest";
import { errorResponse, payloadResponse } from "@user-api/core/lib/apiResponse";
import { getServiceContext } from "@user-api/core/lib/context";
import { ServiceError } from "@user-api/core/lib/serviceError";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { constants } from "http2";
import { CreateUserRequestSchema } from "./validation/create";

export async function main(
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>
) {
  const ctx = getServiceContext({ request });

  try {
    const payload = parseRequestBody(ctx.request.body);

    const { error, data } = CreateUserRequestSchema.safeParse(payload);
    if (error) {
      throw ServiceError.fromZodError(
        {
          detail: "Create user payload failed to parse",
          errorCode: "api.validation.failed",
          statusCode: constants.HTTP_STATUS_BAD_REQUEST,
          title: "Create user failed",
        },
        error
      );
    } else if (!data) {
      throw new ServiceError({
        detail: "Create user payload invalid",
        errorCode: "api.validation.invalid",
        statusCode: constants.HTTP_STATUS_BAD_REQUEST,
        title: "Create user invalid",
      });
    }

    const user = await put(data, true);

    return payloadResponse({ user }, ctx);
  } catch (error) {
    return errorResponse(error as Error, ctx);
  }
}
