import { constants } from "http2";
import { ServiceError } from "./serviceError";

export const parseRequestBody = (body: any) => {
  if (!body) {
    throw new ServiceError({
      detail: "No request body payload was provided",
      errorCode: "api.request.missing",
      statusCode: constants.HTTP_STATUS_BAD_REQUEST,
      title: "Body payload missing",
    });
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new ServiceError({
      detail: "Invalid request body payload was provided",
      errorCode: "api.request.invalid",
      statusCode: constants.HTTP_STATUS_BAD_REQUEST,
      title: "Body payload invalid",
      causedBy: [
        {
          code: "json.parse.error",
          detail: (error as Error).message,
          title: "Parsing json body failed",
        },
      ],
    });
  }
};
