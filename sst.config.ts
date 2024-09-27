/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "user-api",
      region: "us-east-1",
      home: "aws",
    };
  },
  async run() {
    const api = await import("./infra/api");
    await import("./infra/storage");
    const web = await import("./infra/web");

    return {
      Region: aws.getRegionOutput().name,
      SwaggerUI: web.frontend.url,
    };
  },
});
