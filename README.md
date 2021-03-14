# Serverless Udagram - AWS Node.js Typescript

Serverless app for uploading images by groups. Build using serverless lambda functions using API Gateway. With options to send notifications using AWS Simple Notification Service and WebSocket. Build on top of DynamoDB and Elasticsearch used to search through images by name.

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

## Template features

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── models
│   └── create-group-request.json
│   └── create-image-request.json
├── src
│   └── auth
│       └── jwt-tokens.ts
│       └── utils.ts
│   ├── lambda
│   │   ├── auth
│   │   │   ├── auth-authorizer.ts
│   │   │   ├── RS256-auth-authorizer.ts
│   │   ├── dynamoDB
│   │   │   ├── elasticsearch-sync.ts
│   │   ├── http
│   │   │   ├── create-group.ts
│   │   │   ├── create-image.ts
│   │   │   ├── get-gropus.ts
│   │   │   └── get-image.ts
│   │   │   └── get-images.ts
│   │   ├── s3
│   │   │   ├── resize-image.ts
│   │   │   ├── send-upload-notifications.ts
│   │   ├── websocket
│   │   │   ├── connect.ts
│   │   │   ├── disconnect.ts
│   │   │
│   │   └── index.ts         # Import/export of all lambda configurations
│   │
│   └── libs                 # Lambda shared code
│       └── apiGateway.ts    # API Gateway specific helpers
│       └── lambda.ts
│
├── package.json
├── serverless.ts            # Serverless service file
├── tsconfig.json            # Typescript compiler configuration
└── webpack.config.js        # Webpack configuration
```

### 3rd party librairies

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file
