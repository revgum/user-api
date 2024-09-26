import { constants } from "http2";
import { ZodError } from "zod";
import { ServiceErrorCode } from "../types";

type CausedBy = {
  detail: string;
  title: string;
  code: string;
};

interface ServiceErrorArgs {
  detail: string;
  title: string;
  statusCode: number;
  errorCode: ServiceErrorCode;
  causedBy?: CausedBy[];
}

/**
 * The ServiceError class gives us the ability to convert standard Error and
 * ZodError instances into a shared type of error handled throughout the system.
 *
 * The ServiceError helps in returning useful error responses to API callers.
 */
export class ServiceError extends Error {
  statusCode = 400;
  errorCode: ServiceErrorCode;
  detail: string;
  title: string;
  causedBy?: CausedBy[];

  constructor(obj: ServiceErrorArgs);
  constructor(obj?: ServiceErrorArgs) {
    super(obj?.detail);
    Object.setPrototypeOf(this, ServiceError.prototype);

    this.errorCode = obj?.errorCode ?? "general.error";
    this.title = obj?.title ?? "Service Error";
    this.detail = obj?.detail ?? "General service error ";
    this.statusCode =
      obj?.statusCode ?? constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
    this.causedBy = obj?.causedBy;
  }

  public static fromError(error: Error) {
    return new ServiceError({
      detail: error.message,
      errorCode: "general.error",
      title: "Service Error",
      statusCode: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    });
  }

  public static fromZodError(
    obj: Omit<ServiceErrorArgs, "causedBy">,
    error: ZodError
  ) {
    const causedBy: CausedBy[] = error.errors.map((e) => ({
      code: e.code,
      title: e.message,
      detail: `Object field path : ${e.path.join(".")}`,
    }));
    return new ServiceError({
      detail: obj.detail,
      errorCode: obj.errorCode,
      title: obj.title,
      statusCode: obj.statusCode,
      causedBy,
    });
  }
}
