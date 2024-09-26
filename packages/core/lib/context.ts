import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from "aws-lambda";
import { ServiceContext } from "../types";

export const dynamoDb = new DynamoDBClient();

export const documentClient = DynamoDBDocumentClient.from(dynamoDb, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

export const cloudWatch = new CloudWatchClient();

export const getServiceContext = (args: {
  request: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>;
}): ServiceContext => ({
  request: args.request,
  cloudWatch,
  documentClient,
  startTime: performance.now(),
});
