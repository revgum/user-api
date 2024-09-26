import {
  PutMetricDataCommand,
  PutMetricDataInput,
} from "@aws-sdk/client-cloudwatch";
import { APIGatewayEventRequestContextV2 } from "aws-lambda";
import { ApiResponseMeta } from "../types";
import { cloudWatch } from "./context";
import { ServiceError } from "./serviceError";

/**
 * Emit general metrics for API payload and error responses to get some observability
 * into the health and usage of endpoints.
 *
 * TODO: enable "cloudwatch:PutMetricData" action on auto-generated role
 */
const emitMetric = async (args: {
  name: string;
  requestContext: APIGatewayEventRequestContextV2;
  statusCode: number;
  value?: number;
}) => {
  const metric: PutMetricDataInput = {
    Namespace: args.requestContext.apiId,
    MetricData: [
      {
        MetricName: args.name,
        Value: args.value,
        Dimensions: [
          {
            Name: "path",
            Value: args.requestContext.http.path,
          },
          {
            Name: "status_code",
            Value: args.statusCode.toString(),
          },
          {
            Name: "stage",
            Value: args.requestContext.stage,
          },
        ],
      },
    ],
  };

  return cloudWatch.send(new PutMetricDataCommand(metric));
};

export const payloadResponse = async (
  payload: any,
  requestContext: APIGatewayEventRequestContextV2,
  meta: ApiResponseMeta = { version: "1.0.0" },
  statusCode: number = 200
) => {
  meta.requestId = requestContext.requestId;

  /* TODO: enable "cloudwatch:PutMetricData" action on auto-generated role
  await emitMetric({
    name: "payload_response",
    value: 1,
    requestContext,
    statusCode,
  });
  */

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
  requestContext: APIGatewayEventRequestContextV2,
  meta: ApiResponseMeta = { version: "1.0.0" }
) => {
  let error: ServiceError = err as ServiceError;
  if (!(err instanceof ServiceError)) {
    error = ServiceError.fromError(err);
  }

  meta.requestId = requestContext.requestId;

  /* TODO: enable "cloudwatch:PutMetricData" action on auto-generated role
  await emitMetric({
    name: "error_response",
    value: 1,
    requestContext,
    statusCode: error.statusCode,
  });
  */

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
