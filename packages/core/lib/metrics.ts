import {
  PutMetricDataCommand,
  PutMetricDataInput,
} from "@aws-sdk/client-cloudwatch";
import { ServiceContext } from "../types";

/**
 * Emit general metrics for API payload and error responses to get some observability
 * into the health and usage of endpoints.
 *
 * Note:
 * Cloudwatch metric dimensions should not include values unique to individual requests (ie. id values)
 * because they will create individual metrics for that specific request.
 */
export const emit = async (args: {
  name: string;
  metricKind: "increment" | "time";
  ctx: ServiceContext;
  statusCode: number;
  value?: number;
}) => {
  const { metricKind, statusCode, name, ctx, value } = args;
  const metric: PutMetricDataInput = {
    Namespace: ctx.request.requestContext.apiId,
    MetricData: [
      {
        MetricName: name,
        Value: value,
        Dimensions: [
          {
            Name: "metric_kind ",
            Value: metricKind, // increment
          },
          {
            Name: "method",
            Value: ctx.request.requestContext.http.method, // GET
          },
          {
            Name: "route_key",
            Value: ctx.request.requestContext.routeKey, // GET /api/route/{id}
          },
          {
            Name: "status_code",
            Value: statusCode.toString(), // 200
          },
          {
            Name: "stage",
            Value: ctx.request.requestContext.stage, // production
          },
        ],
      },
    ],
  };
  return ctx.cloudWatch.send(new PutMetricDataCommand(metric));
};
