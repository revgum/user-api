export const table = new sst.aws.Dynamo("User", {
  fields: {
    pk: "string",
  },
  primaryIndex: { hashKey: "pk" },
});

export const secret = new sst.Secret("API_KEY");
