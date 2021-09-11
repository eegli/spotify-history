# Spotify History Lambda

A simple Spotify scrobber. Gets your listening history from Spotify, saves it to a database, and creates a weekly backup in Google Drive.

## Features

- [Free of charge\*](#about-billing) - uses the AWS free tier and the Google Drive API, which is free to use
- Utilities to get refresh tokens from both Google and Spotify
- Easily customizable
- Weekly export to Google Drive

## Motivation

By default, Spotify only saves the [last 50 songs you've listened to](https://support.spotify.com/us/article/listening-history/).

This project seeks to provide an easy solution for saving your Spotify listening history in an easily accessible place (Google Drive) where you can retrieve and analyze it quickly.

## Before you start

Unlike Last.FM, Spotify counts as song as _listened to_ when you listen to it for ["over 30 seconds"](https://artists.spotify.com/help/article/how-we-count-streams). The exact behaviour of how Spotify counts a song as _listened to_ is not clear to me, but it seems like 30 seconds are the minimum.

By default, the backup is **scheduled to run weekly** at the start of the week (Monday at 12:30 a.m.). A week is defined according to the [ISO 8610 standard](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) and thus starts on Monday.

By default, **items in the database expire after 30 days** since they have already been backed up and are not needed anymore.

You can customize the backup, schedules, item expiration and much more. [Customization guide](#customization).

## Requirements

- An AWS account
- A Spotify account
- `serverless >= v2.56.0` (this version allows [disabling the schedule based on the stage](https://github.com/serverless/serverless/releases/tag/v2.56.0))

- `node >= v14.17.4`

## Getting started

Before you start, I recommend you [setup a budget in AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/budgets-create.html#create-cost-budget).
You will need to set a budget of at least \$1. [More about billing and if it's "really" free](#about-billing)

The following steps have to be done only one time, stick through it!

1. Fork and download this repository
2. [Create a Spotify application](https://developer.spotify.com/dashboard/applications) - app status "development" is fine - and set the redirect URL to `http://localhost:3000`.
3. In the root directory, create a folder named `.secrets` (notice the dot!)
4. Copy the client secret, client id and scopes to `.secrets/credentials_spotify.json`. The scopes need at least the string `user-read-recently-played`. Your Spotify secrets file should look like this:

```json
{
  "client_id": "<your-client-id>",
  "client_secret": "<your-client-secret>",
  "scopes": "user-read-recently-played"
}
```

5. [Follow the quickstart guide](https://developers.google.com/drive/api/v3/quickstart/nodejs) to create a Google Cloud project and enable the Drive API. Follow the steps. When asked to configure the consent screen, your publishing status should be _testing_. You will need to manually add the Google account who's drive you want to use under "Test users". In the end, you should be prompted to download your OAuth client credentials for your newly created desktop client as a JSON file.
6. Download the credentials file, rename it to `credentials_google.json` and put it in the `.secrets` folder. It should look like this:

```json
{
  "installed": {
    "client_id": "blablabla",
    "project_id": "spotify-history-32as4",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "blablabla",
    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
  }
}
```

7.  Run the following command and follow the steps. This will create a `token_spotify.json` file in the `.secrets` folder containing your long-lived Spotify refresh token. KEEP THIS FILE SECURE!

```console
yarn token:spotify
```

8.  Run the following command and follow the steps. This will create a `token_google.json` file in the `.secrets` folder containing your long-lived Google Drive refresh token. KEEP THIS FILE SECURE!

```console
yarn token:google
```

9. Install the dependencies. Run

```console
yarn
```

10. Done!

## Deploying

This project includes both a staging and production environment. By default, **the schedules are only enabled for production** in order to save quota.

In order to deploy the production version, run:

```console
yarn prod:deploy
```

If you want, you can deploy the staging version as well. The idea behind it is that you can test your changes on AWS if you customize the project.

```console
yarn stg:deploy
```

deploys the entire project while

```console
yarn stg:deploy:history
```

and

```console
yarn stg:deploy:backup
```

only deploys the lambda functions for scrobbing and backing up the history.
Again, the staging functions are NOT scheduled as they are meant to be invoked manually.

```console
yarn stg:invoke:history
```

triggers getting the history from Spotify and saving it to DynamoDB.

```console
yarn stg:invoke:backup
```

triggers the backup.

## Customization

### Changing history properties

By default, these are the properties that are saved to the database (and backup):

```ts
interface DynamoHistoryElement {
  name: string;
  id: string;
  playedAt: string;
  artists: {
    artistName: string;
    artistId: string;
    genres: string;
  }[];
}
```

If you want to save other properties, simply change this interface in `src/config/types.ts` and TypeScript will show you where you'll need to make adjustments. Obviously, it makes sense to at least store the timestamp of when the song was played (`playedAt`) and its id (`id`).

### Changing item expiration in the database

By default, items in DynamoDB are set to expire after 30 days. If you wish to disable this, set the TTL specification in `serverless.yml` to `false` (or remove the implementation altogether for a cleaner codebase).

```yml
TimeToLiveSpecification:
  AttributeName: 'expire_at'
  Enabled: false
```

If you want to specify a different TTL, change the defaultProvider for the attribute `expire_at` in `src/models/history.ts`

### Changing the backup schedule

If you want to change the backup schedule, e.g. running it daily or monthly, you'll need to adjust the cron expression in `serverles.yml`. Here are some resources regarding cron jobs.

- [AWS EventBridge schedule expressions (cron)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)
- [Cron expression tester](https://crontab.cronhub.io/)

**⚠️ Keep in mind that the backup schedule, item expiration and time range to retrieve the items for the backup are logically connected! ⚠️**

If you change the backup schedule, you'll also need to change the time range of the backup in `src/routes/history.ts`.

```ts
// Example: Include history from last month

const timestamp = moment().subtract(1, 'month').toISOString();
```

### Changing the backup folder

Update the stage and production folder names in `src/config/index.ts`.

## Development and Testing

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

```js
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

## Resources

- [Mocking TS method overloads with Jest](https://javascript.plainenglish.io/mocking-ts-method-overloads-with-jest-e9c3d3f1ce0c)
- [Amazon DynamoDB DataMapper For JavaScript](https://github.com/awslabs/dynamodb-data-mapper-js)
- [Amazon DynamoDB DataMapper Annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations)
- [Using the DynamoDB Document Client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)
- [Serverless DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local)
- [TypeScript: adjusting types in reduce function with an async callback](https://dev.to/pedrohasantiago/typescript-adjusting-types-in-reduce-function-with-an-async-callback-2kc8)

### About billing

\* Serverless uses S3 to store the code of the deployed functions. Technically, S3 is not free. It costs [a fraction of a $](https://aws.amazon.com/s3/pricing/?nc=sn&loc=4) per GB, but a deployment takes up so little space, you most likely won't be billed. A full month of testing "cost" me 0.01\$ and I was not billed. Be aware that, if you change the schedules, this project may not be "free" anymore!
