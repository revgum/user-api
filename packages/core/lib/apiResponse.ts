import { ApiResponseMeta, ServiceContext } from "../types";
import { emit } from "./metrics";
import { ServiceError } from "./serviceError";

export const payloadResponse = async (
  payload: any,
  ctx: ServiceContext,
  meta: ApiResponseMeta = { version: "1.0.0" },
  statusCode: number = 200
) => {
  meta.requestId = ctx.request.requestContext.requestId;

  await Promise.all([
    emit({
      name: "payload_response",
      metricKind: "increment",
      value: 1,
      ctx,
      statusCode,
    }),
    emit({
      name: "payload_response_ms",
      metricKind: "time",
      value: performance.now() - ctx.startTime,
      ctx,
      statusCode,
    }),
  ]);

  return {
    statusCode,
    body: JSON.stringify({ meta, payload }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export const errorResponse = async (
  err: ServiceError | Error,
  ctx: ServiceContext,
  meta: ApiResponseMeta = { version: "1.0.0" }
) => {
  let error: ServiceError = err as ServiceError;
  if (!(err instanceof ServiceError)) {
    error = ServiceError.fromError(err);
  }

  meta.requestId = ctx.request.requestContext.requestId;

  await Promise.all([
    emit({
      name: "error_response",
      metricKind: "increment",
      value: 1,
      ctx,
      statusCode: error.statusCode,
    }),
    emit({
      name: "error_response_ms",
      metricKind: "time",
      value: performance.now() - ctx.startTime,
      ctx,
      statusCode: error.statusCode,
    }),
  ]);

  return {
    statusCode: error.statusCode,
    body: JSON.stringify({
      meta,
      error: {
        code: error.errorCode,
        title: error.title,
        detail: error.detail,
        causedBy: error.causedBy,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
