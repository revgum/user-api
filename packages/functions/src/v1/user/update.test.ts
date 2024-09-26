import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { constants } from "http2";
import { afterEach } from "node:test";
import { beforeEach, describe, expect, it } from "vitest";
import { mockRequest, mockUser } from "../shared/test_helpers";
import { main } from "./update";

describe("V1 Update User API", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);

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
    ddbMock.on(PutCommand).resolves({
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
  });

  afterEach(() => {
    ddbMock.reset();
  });

  it("returns a user payload when a user is updated", async () => {
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
      emails: [...user.emails, "another"],
    });
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      error: {
        code: "api.validation.failed",
        detail: "Update user payload failed to parse",
        title: "Update user failed",
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
