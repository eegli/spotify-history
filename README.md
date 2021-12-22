# Spotify History

A simple Spotify scrobbler. Gets your listening history from Spotify, saves it to a database and creates a weekly backup in Google Drive.

<p align="center">
 <img src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/eegli/6a89dcb0ccbc9b64058e7c6a426c6ccb/raw/spotify_history_coverage.json" alt="Coverage">
 <img src="https://img.shields.io/github/languages/top/eegli/spotify-history?label=TypeScript" alt="Languages" />
 <img src="https://img.shields.io/depfu/eegli/spotify-history?label=Dependencies" alt="Dependencies" />
</p>

## Features

- [Free of charge\*](#about-billing) - uses the AWS free tier and the Google Drive API, which is free to use
- Utilities to get refresh tokens from both Google and Spotify
- Easily customizable
- Listening history export to Google Drive

## Motivation

Spotify's API only exposes the [last 50 songs you've listened to](https://support.spotify.com/us/article/listening-history/).

This project seeks to provide an easy and free solution to saving your Spotify listening history in an accessible place (Google Drive) where you can retrieve and analyze it quickly.

Other than that, you can of course use everything here as a starting point/guideline to create something else with Spotify, AWS, Google Drive and Serverless.

## Before you start

- This project makes use of two AWS Lambda functions, one for getting your history from Spotify and one for creating backups in Google Drive.

- Unlike Last.FM, Spotify apparently counts as song as _listened to_ when you listen to it for ["over 30 seconds"](https://artists.spotify.com/help/article/how-we-count-streams). The exact behaviour of how Spotify counts a song as _listened to_ is not clear to me, but it seems like 30 seconds are the minimum.

- By default, the history Lambda (scrobbler) is **scheduled to get the history from Spotify at an hourly interval**. With this interval, most "regular" users who listen through a song will have their full listening history captured. Assuming a very low average song duration of ~2 minutes would mean that one could listen to max. 30 songs per hour. As Spotify keeps track of the last 50 songs you've listened to, this interval would cover the entire hour. However, you may change the schedule.

- By default, the backup Lambda is **scheduled to run weekly** at the start of the week (Monday at 12:30 a.m.). A week is defined according to the [ISO 8610 standard](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) and thus starts on Monday.

- By default, **items in the database expire after 1 month** since they have already been backed up and are not needed anymore.

- You might want to adjust the region in `serverless.yml - provider.region` if you don't live near Frankfurt (default is `eu-central-1`). [Available regions](https://docs.aws.amazon.com/general/latest/gr/rande.html).

You can customize the backup, schedules, item expiration and much more. [Customization guide](#customization).

## Requirements

- An AWS account
- A Spotify account
- `serverless >= v2.56.0`
- `node >= v14.17.4`

## Getting started

Before you start, it's recommended you [setup a budget in AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/budgets-create.html#create-cost-budget).
You will need to set a budget of at least \$1. [More about billing and if this project is "really" free](#about-billing).

The following steps have to be done only once, stick through it!

1. Fork and/or clone this repository and install dependencies:

```bash
git clone git@github.com:eegli/spotify-history.git

cd spotify-history

yarn
```

2. **Spotify setup** - [Create a Spotify application](https://developer.spotify.com/dashboard/applications) - app status "development" is fine - and set the redirect URL to `http://localhost:3000`.
3. In the root directory, create a folder named `.secrets` (notice the dot!)
4. Create a file named `credentials_spotify.json` and copy the template below. Insert your client id and client secret. Your Spotify secrets file should look like this:

```json
{
  "clientId": "<your-client-id>",
  "clientSecret": "<your-client-secret>"
}
```

5. **Google Drive setup** - [Follow the quickstart guide](https://developers.google.com/drive/api/v3/quickstart/nodejs) to create a Google Cloud project and enable the Drive API. When asked to configure the consent screen, your publishing status should be _testing_. You will need to manually add the Google account who's drive you want to use under "Test users". In the end, you should be prompted to download your OAuth client credentials for your newly created desktop client as a JSON file.
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

Almost done!

7.  Run the following command and follow the steps. This will create a `token_spotify.json` file in the `.secrets` folder containing your long-lived Spotify refresh token. **KEEP THIS FILE SECURE!**

```bash
yarn token:spotify
```

8.  Run the following command and follow the steps. This will create a `token_google.json` file in the `.secrets` folder containing your long-lived Google Drive refresh token. **KEEP THIS FILE SECURE!**

```bash
yarn token:google
```

9. Done!

## Deploying the environments

This project includes both a staging and production environment. By default, **the schedules are only enabled in production** in order to save quota. The **staging version** is meant to be deployed but **invoked manually only**.
If you wish to enable the schedule on staging as well, change `serverless.yml`:

```yml
custom:
  scheduleEnabled:
    prod: true
    stg: true # Schedule enabled on staging
```

**Keep in mind that this will double the calls made to Lambda and DynamoDB!**

In order to deploy the production version, run:

```bash
yarn prod:deploy
```

You can deploy the staging version as well:

```bash
# Deploy everything
yarn stg:deploy

# Deploy functions only
yarn stg:deploy:history
yarn stg:deploy:backup
```

Again, the staging functions are **NOT scheduled** by default as they are meant to be invoked manually:

```bash
# Get history from Spotify and save to DynamoDB
yarn stg:invoke:history

# Create backup in Google Drive
yarn stg:invoke:backup
```

## Logging

To check the logs of your Lambda functions, either go to the AWS CloudWatch dashboard or retrieve them in your console.

Example: Getting the logs for production in the last 24h

```bash
sls logs -f spotify-history -s prod --startTime 1d
sls logs -f spotify-history-backup -s prod --startTime 1d
```

[More info about logging with Serverless](https://www.serverless.com/framework/docs/providers/aws/cli-reference/logs/).

## Customization

### Changing history properties

By default, these are the song properties that are saved to the database (and backup):

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

If you want to save other song properties, simply change this interface in `src/config/types.ts` and TypeScript will show you where you'll need to make adjustments. Obviously, it makes sense to at least store the timestamp of when the song was played (`playedAt`) and its id (`id`).

Regarding the `genres` property, read this [blog post](https://eric.film/blog/getting-started-with-the-spotify-api#getting-the-track-genres).

### Changing item expiration in the database

By default, items in DynamoDB are set to expire after 1 month. If you wish to disable this, set the TTL specification in `serverless.yml` to `false` (or remove the implementation altogether for a cleaner codebase).

```yml
TimeToLiveSpecification:
  AttributeName: 'expire_at'
  Enabled: false
```

If you want to specify a different TTL, change the `dynamoExpireAfter` default in `src/config/defaults.ts`

### Changing the backup schedule

If you want to change the backup schedule, e.g. running it daily or monthly, you'll need to adjust the cron expression in `serverles.yml`. Here are some resources regarding cron jobs.

- [AWS EventBridge schedule expressions (cron)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)
- [Cron expression tester](https://crontab.cronhub.io/)

**⚠️ Keep in mind that the backup schedule, item expiration and time range to retrieve the items for the backup are logically connected! ⚠️**

If you change the backup schedule, you'll also need to change the time range of the backup and, most likely, the item TTL as shown above.

```ts
// Example: Include history from last month

const defaults: Readonly<Defaults> = {
  dynamoExpireAfter: [2, 'months'], // Extend the expiration date
  backupRange: [1, 'month'], // Extend the backup range
  ...
};
```

### Changing the backup folder

Update the stage and production folder names in `src/config/defaults.ts`.

Note that, for security reasons, the backup handler only has access to folders and files it has created itself (see [OAuth 2.0 scopes](https://developers.google.com/drive/api/v2/about-auth) and `scripts/google.ts`). For simplicity, the backup folder is created at the root of your Google Drive.

## Development and Testing

### Running DynamoDB locally

For local development, you can use `dynamodb local`. Make sure you have already installed the Node.js dependencies as mentioned above. You'll need this plugin if you want to invoke the Lambdas locally.

1. Install the plugin:

```bash
sls dynamodb install
```

2. Launch DynamoDB. Both commands will migrate tables:

```bash
# With seeding. This will populate the table with 1 item
yarn dynamo:seed
```

```bash
# Without seeding. This will migrate an empty table
yarn dynamo
```

3. Check items in the local table:

```bash
aws dynamodb query --table-name local-spotify-history-db --key-condition-expression "#t = :h" --projection-expression "#dt, #created, #count",  --expression-attribute-names '{\"#t\":\"type\", \"#dt\":\"date\", \"#created\":\"created_at\", \"#count\":\"count\"}' --expression-attribute-values '{\":h\":{\"S\":\"history\"}}' --no-cli-pager --endpoint-url http://localhost:8000
```

Alternatively, go to the shell at `http://localhost:8000/shell/` and query the local table:

```js
dynamodb.scan({ TableName: 'local-spotify-history-db' }, function (err, data) {
  if (err) ppJson(err);
  else ppJson(data);
});
```

4. Invoke locally:

```bash
# Gets the history and saves it to local DynamoDB
yarn local:history

# Backs up the history to Google Drive
yarn local:history
```

### Useful CLI commands

List local table

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

List tables on AWS

```bash
aws dynamodb list-tables
```

## Good to know

The core of this project uses [AWS DynamoDB Data Mapper](https://github.com/awslabs/dynamodb-data-mapper-js). Unfortunately, this package does not seem to be actively maintaned and is only compatible with the AWS SDK v2. By default, [the AWS SDK v2 is included in the Lambda runtime environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html), but not the modular version 3. Those are the reasons why it is currently not possible to upgrade this project to use the modular AWS SDK.

## Resources

- [Mocking TS method overloads with Jest](https://javascript.plainenglish.io/mocking-ts-method-overloads-with-jest-e9c3d3f1ce0c)
- [Amazon DynamoDB DataMapper For JavaScript](https://github.com/awslabs/dynamodb-data-mapper-js)
- [Amazon DynamoDB DataMapper Annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations)
- [Using the DynamoDB Document Client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)
- [Serverless DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local)
- [TypeScript: adjusting types in reduce function with an async callback](https://dev.to/pedrohasantiago/typescript-adjusting-types-in-reduce-function-with-an-async-callback-2kc8)

## About billing

\* Serverless uses S3 to store the code of the deployed functions. Technically, S3 is not free. It costs [a fraction of a $](https://aws.amazon.com/s3/pricing/?nc=sn&loc=4) per GB, but a deployment takes up so little space, you most likely won't be billed. A full month of testing "cost" me 0.01\$ and I was not billed. Be aware that, if you change the schedules, this project may not be "free" anymore!
