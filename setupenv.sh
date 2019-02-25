
#!/bin/sh

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