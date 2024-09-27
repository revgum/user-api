import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
  Table as DDBTable,
  DeleteItemCommand,
  DynamoDBToolboxError,
  Entity,
  GetItemCommand,
  PutItemCommand,
  PutItemInput,
  schema,
  set,
  string,
} from "dynamodb-toolbox";
import { constants } from "http2";
import { Table } from "sst/node/table";
import isBase64 from "validator/es/lib/isBase64";
import isDate from "validator/es/lib/isDate";
import isEmail from "validator/es/lib/isEmail";
import { documentClient } from "../lib/context";
import { ServiceError } from "../lib/serviceError";
import { User, UserData } from "../types";

// Using dynamodb-toolbox, we define and bind the table to the resource
// provisioned by SST
export const UserTable = new DDBTable({
  name: Table.User.tableName,
  documentClient,
  partitionKey: {
    name: "pk",
    type: "string",
  },
});

// Using dynamodb-toolbox, we define the schema for a User and bind it to the
// table definition. Entity schemas enforce validation and serialization to/from
// the table shape.
export const UserEntity = new Entity({
  name: "User",
  table: UserTable,
  schema: schema({
    userId: string()
      .savedAs("pk")
      .key()
      .validate((userId: string) => isBase64(userId, { urlSafe: true })),
    emails: set(string())
      .required()
      .validate((emails) => {
        const size = emails.size;
        if (size >= 3) {
          return "Max number of emails exceeded";
        }
        let errors = [];
        for (const email of emails.values()) {
          if (!isEmail(email, { allow_underscores: true })) {
            errors.push(email);
          }
        }
        if (errors.length) {
          return `Invalid emails: [${errors.join(", ")}]`;
        }
        return true;
      }),
    dob: string()
      .optional()
      .validate((dob) =>
        isDate(dob, { format: "YYYY-MM-DD", strictMode: true })
      ),
    name: string(),
  }),
});

const buildError = (error: Error): ServiceError => {
  if (error instanceof ServiceError) {
    return error;
  }
  if (error instanceof DynamoDBToolboxError) {
    switch (error.code) {
      case "parsing.customValidationFailed":
        return new ServiceError({
          detail: error.payload.validationResult,
          title: `Item validation failed on path: ${error.path}`,
          errorCode: "entity.validation.failed",
          statusCode: constants.HTTP_STATUS_BAD_REQUEST,
        });
      case "parsing.invalidAttributeInput":
        return new ServiceError({
          detail: error.payload,
          title: `Invalid item path: ${error.path}`,
          errorCode: "entity.parsing.failed",
          statusCode: constants.HTTP_STATUS_BAD_REQUEST,
        });
      case "entity.invalidItemSchema":
        return new ServiceError({
          detail: "Entity schema error",
          title: "Invalid item schema",
          errorCode: "entity.invalid",
          statusCode: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        });
    }
  }
  if (error instanceof ConditionalCheckFailedException) {
    return new ServiceError({
      detail: "Entity conditional check failed during persistence",
      title: "Item persistence failed a condition check",
      errorCode: "entity.condition-check.failed",
      statusCode: constants.HTTP_STATUS_UNPROCESSABLE_ENTITY,
    });
  }
  return ServiceError.fromError(error);
};

const asUser = (item: UserData): User => ({
  userId: item.userId,
  dob: item.dob,
  name: item.name,
  emails: Array.from(item.emails),
  created: item.created,
  modified: item.modified,
});

export const get = async (id: string): Promise<User> => {
  try {
    const { Item } = await UserEntity.build(GetItemCommand)
      .key({ userId: id })
      .send();
    if (!Item) {
      throw new ServiceError({
        errorCode: "entity.not-found",
        statusCode: constants.HTTP_STATUS_NOT_FOUND,
        detail: "You do not have access or the user was not found",
        title: "User not found",
      });
    }
    return asUser(Item);
  } catch (error: unknown) {
    throw buildError(error as Error);
  }
};

export const put = async (
  user: Partial<User>,
  existenceCheck = false
): Promise<User> => {
  try {
    const item: PutItemInput<typeof UserEntity> = {
      userId: user.userId!,
      name: user.name!,
      dob: user.dob,
      emails: new Set(user.emails),
    };

    const { ToolboxItem: Item } = await UserEntity.build(PutItemCommand)
      .item(item)
      .options({
        returnValues: "ALL_OLD",
        condition: existenceCheck
          ? { attr: "userId", exists: false }
          : undefined,
      })
      .send();

    if (!Item) {
      throw new ServiceError({
        errorCode: "entity.action.failed",
        statusCode: constants.HTTP_STATUS_BAD_REQUEST,
        detail: "The user failed to create or update",
        title: "User action failed",
      });
    }
    return asUser(Item);
  } catch (error: unknown) {
    throw buildError(error as Error);
  }
};

export const destroy = async (userId: string): Promise<void> => {
  try {
    await UserEntity.build(DeleteItemCommand).key({ userId }).send();
  } catch (error: unknown) {
    throw buildError(error as Error);
  }
};
