import { Api, StackContext, Table } from "sst/constructs";

export function UserStack({ stack }: StackContext) {
  const table = new Table(stack, "User", {
    fields: {
      pk: "string",
    },
    primaryIndex: { partitionKey: "pk" },
  });

  // Create the HTTP API
  const api = new Api(stack, "UserApi", {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      "GET /v1/users/{id}": "packages/functions/src/v1/user/get.main",
      "POST /v1/users": "packages/functions/src/v1/user/create.main",
      "DELETE /v1/users/{id}": "packages/functions/src/v1/user/delete.main",
      "PUT /v1/users/{id}": "packages/functions/src/v1/user/update.main",
      "PATCH /v1/users/{id}": "packages/functions/src/v1/user/update.main",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
