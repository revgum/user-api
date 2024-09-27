import { randomUUID } from "crypto";
import { Config } from "sst/node/config";
import { ServiceError } from "./serviceError";
import { constants } from "http2";

const API_KEY =
  process.env.TEST === "true" ? process.env.API_KEY : Config.API_KEY;

/**
 * A very basic API auth solution using a secret API_KEY that must be included in the
 * "Authorization" header formatted as "Bearer <API_KEY>". Not designed for use
 * in production, you should implement handling proper JWT and/or persisting sessions.
 * @param authorization The value from the "Authorization" header
 * @returns an isLoggedIn flag and a userId for the authenticated user
 */
export const authenticate = (
  authorization?: string
): { isLoggedIn: boolean; userId: string } => {
  if (!authorization) {
    throw new ServiceError({
      detail: "Authorization header not provided",
      errorCode: "api.authorization.missing",
      statusCode: constants.HTTP_STATUS_BAD_REQUEST,
      title: "Authorization missing",
    });
  }
  const [_, apiKey] = authorization.split(" ");
  if (apiKey !== API_KEY) {
    throw new ServiceError({
      detail: "Access is forbidden, authentication key failed",
      errorCode: "api.authentication.failed",
      statusCode: constants.HTTP_STATUS_FORBIDDEN,
      title: "Authentication failed",
    });
  }
  return { isLoggedIn: true, userId: randomUUID() };
};
