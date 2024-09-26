import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { constants } from "http2";
import { afterEach } from "node:test";
import { beforeEach, describe, expect, it } from "vitest";
import { mockRequest, mockUser } from "../shared/test_helpers";
import { main } from "./delete";

describe("V1 Delete User API", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);

  const user = mockUser();
  const timestamp = new Date().toISOString();

  beforeEach(() => {
    ddbMock.on(DeleteCommand).resolves({
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

  it("returns a message when a user is deleted", async () => {
    const request = mockRequest("", user.userId);
    const response = await main(request);
    const responseBody = JSON.parse(response.body);

    expect(response.headers["Content-Type"]).toEqual("application/json");
    expect(responseBody).toMatchObject({
      meta: { version: "1.0.0", requestId: expect.any(String) },
      payload: {
        message: "User deleted",
      },
    });
    expect(response.statusCode).toEqual(constants.HTTP_STATUS_OK);
  });

  it("returns an error payload if dynamodb throws an unhandled error", async () => {
    ddbMock.on(DeleteCommand).rejects(new Error("unhandled error"));
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
