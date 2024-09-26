import { payloadResponse, errorResponse } from "@user-api/core/lib/apiResponse";
import { parseRequestBody } from "@user-api/core/lib/apiRequest";
import { put } from "@user-api/core/entities/user";
import { CreateUserRequestSchema } from "./validation/create";
import { ServiceError } from "@user-api/core/lib/serviceError";
import { constants } from "http2";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";

export async function main({
  body,
  requestContext,
}: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>) {
  try {
    const payload = parseRequestBody(body);

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

    return payloadResponse(
      {
        user,
      },
      requestContext
    );
  } catch (error) {
    return errorResponse(error as Error, requestContext);
  }
}
