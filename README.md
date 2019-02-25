# AppSync Real-Time Reference Architecture

![Overview](/media/realtime-refarch.png)

## Getting Started

### Prerequisites

- [AWS Account](https://aws.amazon.com/mobile/details) with appropriate permissions to create the related resources
- [NodeJS](https://nodejs.org/en/download/) with [NPM](https://docs.npmjs.com/getting-started/installing-node)
- [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) with output configured as JSON `(pip install awscli --upgrade --user)`
- [AWS Amplify CLI](https://github.com/aws-amplify/amplify-cli) configured for a region where [AWS AppSync](https://docs.aws.amazon.com/general/latest/gr/rande.html) and all other services in use are available `(npm install -g @aws-amplify/cli)`
- [AWS SAM CLI](https://github.com/awslabs/aws-sam-cli) `(pip install --user aws-sam-cli)`
- [Create React App](https://github.com/facebook/create-react-app) `(npm install -g create-react-app)`
- [Install JQ](https://stedolan.github.io/jq/)
- If using Windows, you'll need the [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

### Back End Setup

1. Install the required modules:

    ```bash
    npm install
    ```

2. Init the directory as an amplify Javascript project using the React framework:
   
    ```bash
    amplify init
    ```

3. Add an **Amazon Cognito User Pool** auth resource. Use the default configuration.

   ```bash
   amplify add auth
   ```

4. Add an AppSync GraphQL API. Follow the default options. When prompted with "Do you have an annotated GraphQL schema?", select "NO" and copy/paste the schema from the file `schema.graphql` in this repo. It will use [GraphQL Transform](https://aws-amplify.github.io/docs/cli/graphql?sdk=js)  [@model](https://aws-amplify.github.io/docs/cli/graphql?sdk=js#model) directives to create DynamoDB tables:

    ```bash
   amplify add api
   ```
5. Now it's time to provision your cloud resources based on the local setup and configured features:

   ```bash
   amplify push
   ```

   Wait for the provisioning to complete. Once done, a `src/aws-exports.js` file with the resources information is created.
6. Execute the script `setupenv.sh` to configure some environment variables
7. Install the Lambda dependencies and deploy the backend with SAM:
    ```bash
   cd ./sam-app/get-movie;npm install; cd ..
   sam package --template-file ./sam-app/template.yaml --s3-bucket $DEPLOYMENT_BUCKET_NAME --output-template-file packaged.yaml --region $AWS_REGION
   export STACK_NAME_SAM="$STACK_NAME-extra"
   sam deploy --template-file ./packaged.yaml --stack-name $STACK_NAME_SAM --capabilities CAPABILITY_IAM --parameter-overrides unauthRole=$UNAUTH_ROLE graphqlApi=$GRAPHQL_API_ID graphqlEndpoint=$GRAPHQL_ENDPOINT --region $AWS_REGION
   ```
8.  Finally, execute the following command to install your project package dependencies and run the application locally:

    ```bash
    amplify serve
    ```
9.  Open different browsers and test realtime subscriptions

## License Summary
This sample code is made available under a modified MIT license. See the LICENSE file.