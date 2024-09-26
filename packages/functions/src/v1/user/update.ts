import { get, put } from "@user-api/core/entities/user";
import { parseRequestBody } from "@user-api/core/lib/apiRequest";
import { errorResponse, payloadResponse } from "@user-api/core/lib/apiResponse";
import { ServiceError } from "@user-api/core/lib/serviceError";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { constants } from "http2";
import { UpdateUserRequestSchema } from "./validation/update";

export async function main({
  body,
  pathParameters,
  requestContext,
}: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>) {
  try {
    const id = pathParameters!.id!;
    const payload = parseRequestBody(body);

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

    data.emails = data.emails ? data.emails.concat(user.emails) : user.emails;
    data.dob = data.dob ?? user.dob;
    data.name = data.name ?? user.name;

    const updatedUser = await put({ ...data, userId: id }, true);

    return payloadResponse(
      {
        user: updatedUser,
      },
      requestContext
    );
  } catch (error) {
    return errorResponse(error as Error, requestContext);
  }
}
