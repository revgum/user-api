## Highlights

- **Versioned API** : Request and response versioning for all API endpoints.
- **Metrics** : Cloudwatch metrics for API endpoint performance and health monitoring.
- **[OpenAPI Spec](doc/api-spec.md)** : Full API documentation and benefit of OpenAPI.
- **SwaggerUI Static Site** : A basic static site deployment hosting SwaggerUI and the API spec.
- **[DynamoDB Toolbox](https://www.dynamodbtoolbox.com/)** : Lightweight and type-safe query builder for DynamoDB.
- **Authorization** : API key authorization.

## [API Spec](doc/api-spec.md)

## Setup

### Requirements

- [Node 20](https://nodejs.org/en/download/package-manager/current)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions) and [credentials configured](https://docs.sst.dev/advanced/iam-credentials#loading-from-a-file)

### Getting Started

#### Setup API_KEY secret

Each deployed stage will require a secret `API_KEY` created to allow access to the API.
(**_This authentication solution is not intended for production purposes and should be improved for any serious deployments._**)

Run the following command and supply the API key value for `<your-key-here>`:

```bash
npm run secrets:set API_KEY <your-key-here>
```

## [Testing](docs/testing.md)

## Deployment

By default a local stage is built for development purposes, using the `npm run dev` command will launch the application. SST connects from the AWS cloud to your local machine to use local code and provide a realtime development experience while resources are hosted in the cloud.

### Manually deploy `production`

```base
npm run deploy -- --stage production
```
