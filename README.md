# AWS AppSync Real-Time Reference Architecture

![Overview](/media/realtime-refarch.png)

The AWS AppSync Serverless GraphQL real-time reference architecture showcases different types of real-time data broadcasting using GraphQL subscriptions over WebSockets:

- Back-end broadcasting: From a serverless backend to all clients (one to many)
- Client broadcasting: Between multiple clients (many to many)

With different types of backends:

- Amazon DynamoDB (NoSQL Serverless database)
- AWS Lambda (Serverless compute logic)
- AWS AppSync Local Resolvers (Pub/Sub, data is not persisted)

The sample app is based on second screen kind of experiences where you usually have something getting broadcasted to all connected users, that in turn can interact with each other as well as see the activity of other users in real-time. We have a single movie poster and description retrieved from the TMDb popular movies API and shared with all clients for a short amount of time before it's rotated, users can vote on how they feel about the current movie as well as express their opinion in a public chat room. The most voted movies at any specific time on different categories are displayed on a leader board.

For more information refer to the article https://medium.com/open-graphql/aws-appsync-serverless-graphql-real-time-reference-architecture-19b16f5e9b93

### Quicklinks

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [One-Click Deploy with the Amplify Console](#one-click-deploy-with-the-amplify-console)
  - [Manual Setup](#manual-setup)
- [Clean Up](#clean-up)

## Getting Started

### Prerequisites

- Create an account on TMDb and generate an [API Key](https://developers.themoviedb.org/3/getting-started/introduction) **absolutely free for non-commercial use**
- [AWS Account](https://aws.amazon.com/mobile/details) with appropriate permissions to create the related resources
- [NodeJS](https://nodejs.org/en/download/) with [NPM](https://docs.npmjs.com/getting-started/installing-node)
- [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) with output configured as JSON `(pip install awscli --upgrade --user)`
- [AWS Amplify CLI](https://github.com/aws-amplify/amplify-cli) configured for a region where [AWS AppSync](https://docs.aws.amazon.com/general/latest/gr/rande.html) and all other services in use are available `(npm install -g @aws-amplify/cli)`
- [AWS SAM CLI](https://github.com/awslabs/aws-sam-cli) `(pip install --user aws-sam-cli)`
- [Create React App](https://github.com/facebook/create-react-app) `(npm install -g create-react-app)`
- [Install JQ](https://stedolan.github.io/jq/)
- If using Windows, you'll need the [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

### One-Click Deploy with the Amplify Console

Click the button to load the AWS Amplify Console, connect to GitHub and provide an IAM role for the build. The end to end back-end and front-end deployment should take around 10 minutes:

<p align="center">
    <a href="https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/aws-samples/appsync-refarch-realtime" target="_blank">
        <img src="https://oneclick.amplifyapp.com/button.svg" alt="Deploy to Amplify Console">
    </a>
</p>

After the build is finished go to the [AWS AppSync Console](https://console.aws.amazon.com/appsync/home), access your newly deployed "realtime" GraphQL API and open the `Queries` section. Execute the following mutation to create the data structure that will collect and store votes in the Reviews table:

```graphql
mutation {
  type1: createReviews(
    input: { id: 1, type: "love", votes: 0, topMovie: "N/A", topVotes: 0 }
  ) {
    id
    type
    votes
    topMovie
    topVotes
  }

  type2: createReviews(
    input: { id: 2, type: "like", votes: 0, topMovie: "N/A", topVotes: 0 }
  ) {
    id
    type
    votes
    topMovie
    topVotes
  }

  type3: createReviews(
    input: { id: 3, type: "meh", votes: 0, topMovie: "N/A", topVotes: 0 }
  ) {
    id
    type
    votes
    topMovie
    topVotes
  }

  type4: createReviews(
    input: { id: 4, type: "unknown", votes: 0, topMovie: "N/A", topVotes: 0 }
  ) {
    id
    type
    votes
    topMovie
    topVotes
  }

  type5: createReviews(
    input: { id: 5, type: "hate", votes: 0, topMovie: "N/A", topVotes: 0 }
  ) {
    id
    type
    votes
    topMovie
    topVotes
  }
}
```

---

**IMPORTANT**: The button above is using a shared TMDb API Key that can be [rate limited](https://developers.themoviedb.org/3/getting-started/request-rate-limiting) depending on the number of deployments using it at the same time, if there's a throttling issue we recommend to create your own [API Key](https://developers.themoviedb.org/3/getting-started/introduction) on TMDb. In that case follow the steps below:

---

1. The one-click deploy button above would have created a fork of this repo in your account. Edit the file `amplify.yml` and add your **free for non-commercial use** TMDb [API Key](https://developers.themoviedb.org/3/getting-started/introduction) (refer to Prerequisites) on line 13:

   ```bash
   - export TMDB_API_KEY=<YOUR TMDB API KEY HERE>
   ```

---

**IMPORTANT**: This is a public and free API for a sample application that demonstrates different real-time use cases for unauthenticated/public users. In production scenarios secure API Keys or other important service credentials with [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) or [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) for increased security. The current approach will use [Environment Variables](https://docs.aws.amazon.com/lambda/latest/dg/env_variables.html) in AWS Lambda.

---

2. Commit the changes to your forked repository.
3. The [Amplify Console](https://console.aws.amazon.com/amplify/home?#/create) will kickoff another build. Wait for the build, deployment and verification steps to finish.
4. Go to the [AWS AppSync Console](https://console.aws.amazon.com/appsync/home), access your newly deployed "realtime" GraphQL API and open the `Queries` section. Execute the 5 mutations as mentioned below the one-click deploy button.
5. Access your app from the hosted site generated by the Amplify Console from multiple browsers or devices, testing the multiple real-time subscription scenarios (https://master.xxxxxxxx.amplifyapp.com)

### Manual Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/aws-samples/appsync-refarch-realtime.git
   cd appsync-refarch-realtime
   ```

2. Install the required modules:

   ```bash
   npm install
   ```

3. Init the directory as an amplify Javascript project using the React framework:

   ```bash
   amplify init
   ```

4. Now it's time to provision your cloud resources based on the local setup and configured features, execute the following command accepting all default options:

   ```bash
   amplify push
   ```

   Wait for the provisioning to complete. Once done, a `src/aws-exports.js` file with the resources information is created.

5. Execute the following command in a shell terminal and add your **free for non-commercial use** TMDb API Key (refer to Prerequisites):

   ```bash
   export TMDB_API_KEY=<YOUR TMDB API KEY HERE>
   ```

---

**IMPORTANT**: This is a public and free API for a sample application that demonstrates different real-time use cases for unauthenticated/public users. In production scenarios secure API Keys or other important service credentials with [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) or [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) for increased security. The current approach will use [Environment Variables](https://docs.aws.amazon.com/lambda/latest/dg/env_variables.html) in AWS Lambda.

---

6.  Execute the following commands in a shell terminal to set up additional environment variables as well as configure IAM authentication:

    ```bash
    export AWS_REGION=$(jq -r '.providers.awscloudformation.Region' amplify/#current-cloud-backend/amplify-meta.json)
    export GRAPHQL_API_ID=$(jq -r '.api[(.api | keys)[0]].output.GraphQLAPIIdOutput' ./amplify/#current-cloud-backend/amplify-meta.json)
    export GRAPHQL_API_NAME=$(aws appsync get-graphql-api --api-id $GRAPHQL_API_ID --region $AWS_REGION | jq -r '.graphqlApi.name')
    export GRAPHQL_ENDPOINT=$(sed -n 's/.*"aws_appsync_graphqlEndpoint": "\(.*\)".*/\1/p' src/aws-exports.js)
    export UNAUTH_ROLE=$(jq -r '.providers.awscloudformation.UnauthRoleName' amplify/#current-cloud-backend/amplify-meta.json)
    export ID_POOL_ID=$(sed -n 's/.*"aws_cognito_identity_pool_id": "\(.*\)".*/\1/p' src/aws-exports.js)
    export ID_POOL_NAME=$(jq -r '.auth[(.auth | keys)[0]].output.IdentityPoolName' ./amplify/#current-cloud-backend/amplify-meta.json)
    export DEPLOYMENT_BUCKET_NAME=$(jq -r '.providers.awscloudformation.DeploymentBucketName' ./amplify/#current-cloud-backend/amplify-meta.json)
    export STACK_NAME=$(jq -r '.providers.awscloudformation.StackName' ./amplify/#current-cloud-backend/amplify-meta.json)
    aws cognito-identity update-identity-pool --identity-pool-id $ID_POOL_ID --identity-pool-name $ID_POOL_NAME --allow-unauthenticated-identities  --region $AWS_REGION
    aws appsync update-graphql-api --api-id $GRAPHQL_API_ID --name $GRAPHQL_API_NAME --authentication-type AWS_IAM --region $AWS_REGION
    ```

7.  Install the Lambda dependencies and deploy the backend with SAM:

    ```bash
    cd ./sam-app/get-movie;npm install; cd ../..
    sam package --template-file ./sam-app/template.yaml --s3-bucket $DEPLOYMENT_BUCKET_NAME --output-template-file packaged.yaml --region $AWS_REGION
    export STACK_NAME_SAM="$STACK_NAME-lambda"
    sam deploy --template-file ./packaged.yaml --stack-name $STACK_NAME_SAM --capabilities CAPABILITY_IAM --parameter-overrides unauthRole=$UNAUTH_ROLE graphqlApi=$GRAPHQL_API_ID graphqlEndpoint=$GRAPHQL_ENDPOINT tmdbApiKey=$TMDB_API_KEY --region $AWS_REGION
    ```

8.  Execute the following command to access and query your API directly from the AWS Console (or manually go to the [AWS AppSync Console](https://console.aws.amazon.com/appsync/home), access your API and open the `Queries` section):

    ```bash
    amplify console
    ? Please select the category or provider: api
    ? Please select from one of the below mentioned services: GraphQL
    ```

9.  Execute the following mutation to create the data sctructure that will collect and store votes in the Reviews table:

    ```graphql
    mutation {
      type1: createReviews(
        input: { id: 1, type: "love", votes: 0, topMovie: "N/A", topVotes: 0 }
      ) {
        id
        type
        votes
        topMovie
        topVotes
      }

      type2: createReviews(
        input: { id: 2, type: "like", votes: 0, topMovie: "N/A", topVotes: 0 }
      ) {
        id
        type
        votes
        topMovie
        topVotes
      }

      type3: createReviews(
        input: { id: 3, type: "meh", votes: 0, topMovie: "N/A", topVotes: 0 }
      ) {
        id
        type
        votes
        topMovie
        topVotes
      }

      type4: createReviews(
        input: {
          id: 4
          type: "unknown"
          votes: 0
          topMovie: "N/A"
          topVotes: 0
        }
      ) {
        id
        type
        votes
        topMovie
        topVotes
      }

      type5: createReviews(
        input: { id: 5, type: "hate", votes: 0, topMovie: "N/A", topVotes: 0 }
      ) {
        id
        type
        votes
        topMovie
        topVotes
      }
    }
    ```

10. Finally, execute the following command to install your project package dependencies and run the application locally:

        amplify serve

11. Open different browsers and test realtime subscriptions. Alternativelly publish your application and use the public link:

    ```bash
    amplify add hosting
    amplify publish
    ```

<p align="center">
        <img src="media/reactapp.png" alt="Real-Time App">
    </a>
</p>

### Clean Up

To clean up the project, you can simply delete the stack created by the SAM CLI:

```bash
aws cloudformation delete-stack --stack-name $STACK_NAME_SAM --region $AWS_REGION
```

and use:

```bash
amplify delete
```

to delete the resources created by the Amplify CLI.

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
