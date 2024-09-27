import { Api, Config, StackContext, Table, StaticSite } from "sst/constructs";
import { v1Routes } from "../packages/functions/src/v1/routes";

export function UserStack({ stack }: StackContext) {
  const API_KEY = new Config.Secret(stack, "API_KEY");

  const table = new Table(stack, "User", {
    fields: {
      pk: "string",
    },
    primaryIndex: { partitionKey: "pk" },
  });

  const api = new Api(stack, "UserApi", {
    defaults: {
      function: {
        bind: [API_KEY, table],
        permissions: ["cloudwatch:PutMetricData"],
      },
    },
    routes: {
      ...v1Routes,
    },
  });

  const site = new StaticSite(stack, "SwaggerUI", {
    path: "packages/site",
    waitForInvalidation: process.env.IS_LOCAL ? false : true,
    dev: {
      deploy: true,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SwaggerSiteUrl: site.url,
  });
}
