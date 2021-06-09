# Spotify History Lambda

A simple Spotify scrobber. Deployed for free on AWS. Built with Serverless.

## Running DynamoDB locally

Make sure you have already installed the Node.js dependencies as mentioned above.

1. Install the plugin:

```bash
sls dynamodb install
```

2. Launch DynamoDB. Both commands will migrate tables.

```bash
# With seeding. This will populate the table with 3 mocks songs
yarn dynamo:start
```

```bash
# Without seeding. This will migrate an empty table
yarn dynamo:start:noseed
```

```javascript
dynamodb.scan({ TableName: 'local-spotify-history-db' }, function (err, data) {
  if (err) ppJson(err);
  // an error occurred
  else ppJson(data); // successful response
});
```

## Resources

- [Amazon DynamoDB DataMapper For JavaScript](https://github.com/awslabs/dynamodb-data-mapper-js)
- [Amazon DynamoDB DataMapper Annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations)
- [Using the DynamoDB Document Client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)
- [Serverless DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local)
