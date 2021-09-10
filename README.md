# Spotify History Lambda

A simple Spotify scrobber.

## Features

- Free of charge. Uses the AWS free tier and the Google Drive API, which is free to use.
- Easily customizable
- Export to CSV via AWS Console

## Motivation

By default, Spotify only saves the [last 50 songs you've listened to](https://support.spotify.com/us/article/listening-history/).
Apparently, Spotify counts as song as "listened to" when you listen to it for ["over 30 seconds"](https://artists.spotify.com/help/article/how-we-count-streams)

The backup is scheduled to run weekly at the start of the week (Monday at 12:30 a.m.). A week is defined according to the [ISO 8610 standard](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) and thus starts on Monday.

If you want to change the schedule, you will need to edit the cron expression of the `spotify-history-lambda-backup` function in `serverless.yml`. Optionally, you might want to adjust your backups' "metadata" in `src/index.ts - backupParams`

## Getting started

1.  Create a Spotify app and add the client secret, client id and scopes to `credentials_spotify.json` in the root folder. The scopes need at least the string `user-read-recently-played`.

```json
{
  "client_id": "<your-client-id>",
  "client_secret": "<your-client-secret>",
  "scopes": "<your-scopes, user-read-recently-played>"
}
```

2.  Create a Google Cloud app and download the credentials file, rename to `credentials_google.json` and put it in the root dir. It should look like this:

```json
{
  "installed": {
    "client_id": "5893332219-vtm97e3akfloogqq06quu0t710l7ak34.apps.googleusercontent.com",
    "project_id": "spotify-history-32as4",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "ersRaKzZdQODDtRSQz4ygLZ",
    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
  }
}
```

3.  Run the following command and follow the steps. This will create a `token_spotify.json` file in the root dir containing your long-lived Spotify refresh token.

```console
yarn token:spotify
```

4.  Run the following command and follow the steps. This will create a `token_google.json` file in the root dir containing your long-lived Google Drive refresh token.

```console
yarn token:google
```

5. Run the following command to generate the `.env` file containing all the secrets and env variables.

```console
yarn generate:env
```

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

List all local tables

```console
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

List all timestamps in local table

```console
aws dynamodb query --table-name stg-spotify-history-db --key-condition-expression "#t = :h" --projection-expression "#ts, #dt" --expression-attribute-names '{\"#t\":\"type\", \"#ts\":\"timestamp\", \"#dt\":\"date\"}' --expression-attribute-values '{\":h\":{\"S\":\"history\"}}'
```

## Customization

- [AWS EventBridge schedule expressions (cron)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)
- [Cron expression tester](https://crontab.cronhub.io/)

## Resources

- [Mocking TS method overloads with Jest](https://javascript.plainenglish.io/mocking-ts-method-overloads-with-jest-e9c3d3f1ce0c)
- [Amazon DynamoDB DataMapper For JavaScript](https://github.com/awslabs/dynamodb-data-mapper-js)
- [Amazon DynamoDB DataMapper Annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations)
- [Using the DynamoDB Document Client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)
- [Serverless DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local)
- [TypeScript: adjusting types in reduce function with an async callback](https://dev.to/pedrohasantiago/typescript-adjusting-types-in-reduce-function-with-an-async-callback-2kc8)
