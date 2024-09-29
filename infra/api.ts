import { table, secret } from "./storage";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  transform: {
    route: {
      handler: {
        link: [table, secret],
        permissions: [
          {
            actions: ["cloudwatch:PutMetricData"],
            resources: ["*"],
          },
        ],
      },
    },
  },
});

api.route("GET /v1/users/{id}", "packages/functions/src/v1/user/get.main");
api.route("POST /v1/users", "packages/functions/src/v1/user/create.main");
api.route(
  "DELETE /v1/users/{id}",
  "packages/functions/src/v1/user/delete.main"
);
api.route("PUT /v1/users/{id}", "packages/functions/src/v1/user/update.main");
api.route("PATCH /v1/users/{id}", "packages/functions/src/v1/user/patch.main");
