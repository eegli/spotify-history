# Spotify History Lambda

A simple Spotify scrobber.

## Features

- Free of charge. Uses the AWS free tier
- Easily customizable
- Export to CSV via AWS Console

## Getting started

wip

## Running DynamoDB locally

Make sure you have already installed the Node.js dependencies as mentioned above.

1. Install the plugin:

```console
sls dynamodb install
```

2. Launch DynamoDB. Both commands will migrate tables.

```console
# With seeding. This will populate the table with 3 mocks songs
yarn dynamo:start
```

```console
# Without seeding. This will migrate an empty table
yarn dynamo:start:noseed
```

3. Query your table for all items to check for insertions

```javascript
dynamodb.scan({ TableName: 'local-spotify-history-db' }, function (err, data) {
  if (err) ppJson(err);
  else ppJson(data);
});
```

## Resources

- [Amazon DynamoDB DataMapper For JavaScript](https://github.com/awslabs/dynamodb-data-mapper-js)
- [Amazon DynamoDB DataMapper Annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations)
- [Using the DynamoDB Document Client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)
- [Serverless DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local)
