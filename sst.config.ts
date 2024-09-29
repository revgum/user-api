/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(_input) {
    return {
      name: "user-api",
      home: "aws",
      providers: {
        aws: {
          region: "us-west-2",
        },
      },
    };
  },
  async run() {
    await import("./infra/storage");
    await import("./infra/api");
    const web = await import("./infra/web");

    return {
      Region: aws.getRegionOutput().name,
      SwaggerUI: web.frontend.url,
    };
  },
});
