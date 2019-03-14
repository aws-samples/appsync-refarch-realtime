import React from 'react';
import AWSAppSyncClient from 'aws-appsync'
import awsmobile from './aws-exports'
import { ApolloProvider } from 'react-apollo'
import { Rehydrated } from 'aws-appsync-react' // this needs to also be installed when working with React

import App from './App'

const client = new AWSAppSyncClient({  
  url: awsmobile.aws_appsync_graphqlEndpoint,
  region: awsmobile.aws_appsync_region,
  auth: {
    type: 'AWS_IAM'
  }
})

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
)

export default WithProvider