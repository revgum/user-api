import {
  CloudWatchClient,
  PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { constants } from "http2";
import { afterEach } from "node:test";
import { beforeEach, describe, expect, it } from "vitest";
import { mockRequest, mockUser } from "../shared/test_helpers";
import { main } from "./patch";

describe("V1 Patch User API", () => {
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
    ddbMock.on(UpdateCommand).resolves({
      Attributes: {
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

  it("returns a user payload when a user is patched", async () => {
    const request = mockRequest(user, user.userId);
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

  it("returns an error payload when the request is missing a body", async () => {
    const request = mockRequest("", user.userId);
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.request.missing",
        title: "Body payload missing",
        detail: "No request body payload was provided",
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
  });

  it("returns the user disregarding invalid payload fields", async () => {
    const request = mockRequest({ bad: "field" }, user.userId);
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    console.dir(responseBody, { depth: null });
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

  it("returns an error payload with validation error when the user has too many emails", async () => {
    const request = mockRequest({
      ...user,
      emails: [
        ...user.emails,
        "two@example.com",
        "three@example.com",
        "four@example.com",
      ],
    });
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.validation.failed",
        detail: "Patch user payload failed to parse",
        title: "Patch user failed",
        causedBy: [
          {
            code: "too_big",
            title: "Array must contain at most 3 element(s)",
            detail: "Object field path : emails",
          },
        ],
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
  });

  it("returns an error payload with validation error when the user has an invalid email", async () => {
    const request = mockRequest({
      ...user,
      emails: [...user.emails, "another"],
    });
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.validation.failed",
        detail: "Patch user payload failed to parse",
        title: "Patch user failed",
        causedBy: [
          {
            code: "invalid_string",
            title: "Invalid email",
            detail: "Object field path : emails.1",
          },
        ],
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
  });

  it("returns an error payload with validation error when the user has an invalid dob", async () => {
    const request = mockRequest({ ...user, dob: "20000101" });
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.validation.failed",
        detail: "Patch user payload failed to parse",
        title: "Patch user failed",
        causedBy: [
          {
            code: "invalid_string",
            title: "Invalid date",
            detail: "Object field path : dob",
          },
        ],
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
  });

  it("returns an error payload when the user is not found", async () => {
    ddbMock.on(GetCommand).resolves({
      Item: undefined,
    });
    const request = mockRequest(user, user.userId);
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
    const request = mockRequest(user, user.userId);
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
