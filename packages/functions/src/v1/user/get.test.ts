import {
  CloudWatchClient,
  PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { constants } from "http2";
import { afterEach } from "node:test";
import { beforeEach, describe, expect, it } from "vitest";
import { mockRequest, mockUser } from "../shared/test_helpers";
import { main } from "./get";

describe("V1 Get User API", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const cwMock = mockClient(CloudWatchClient);

  const user = mockUser();
  const timestamp = new Date().toISOString();
  const today = timestamp.substring(0, 10);

  beforeEach(() => {
    ddbMock.on(GetCommand).resolves({
      Item: {
        _et: "User",
        _ct: timestamp,
        _md: timestamp,
        pk: user.userId,
        dob: user.dob,
        name: user.name,
        emails: new Set(user.emails),
      },
    });
    cwMock.on(PutMetricDataCommand).resolves({});
  });

  afterEach(() => {
    ddbMock.reset();
    cwMock.reset();
  });

  it("returns a user payload when a user is found", async () => {
    const request = mockRequest("", user.userId);
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      payload: {
        user: {
          ...user,
          created: expect.stringContaining(today),
          modified: expect.stringContaining(today),
        },
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_OK);
  });

  it("returns an error payload when the request is missing the authorization header", async () => {
    const request = mockRequest("");
    request.headers = {};
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.authorization.missing",
        detail: "Authorization header not provided",
        title: "Authorization missing",
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
  });

  it("returns an error payload when the request authorization header has an invalid key", async () => {
    const request = mockRequest("");
    request.headers = { authorization: "Bearer nope-not-this-one" };
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.authentication.failed",
        detail: "Access is forbidden, authentication key failed",
        title: "Authentication failed",
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_FORBIDDEN);
  });

  it("returns an error payload when the user is not found", async () => {
    ddbMock.on(GetCommand).resolves({
      Item: undefined,
    });
    const request = mockRequest("", user.userId);
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "entity.not-found",
        title: "User not found",
        detail: "You do not have access or the user was not found",
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_NOT_FOUND);
  });

  it("returns an error payload if dynamodb throws an unhandled error", async () => {
    ddbMock.on(GetCommand).rejects(new Error("unhandled error"));
    const request = mockRequest("", user.userId);
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "general.error",
        title: "Service Error",
        detail: "unhandled error",
      },
    });
    expect(response.statusCode).toEqual(
      constants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    );
  });
});
