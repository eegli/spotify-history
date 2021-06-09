1. Write your functions
2. Use `serverless deploy` only when you've made changes to serverless.yml and in CI/CD systems. For more information on setting up CI/CD for your Serverless app, read this article.
3. Use `serverless deploy function -f myFunction` to rapidly deploy changes when you are working on a specific AWS Lambda Function.
4. Use `serverless invoke -f myFunction -l` to test your AWS Lambda Functions on AWS.
5. Open up a separate tab in your console and stream logs in there via `serverless logs -f myFunction -t`.
6. Write tests to run locally.

```js
dynamodb.scan({ TableName: 'local-spotify-history-db' }, function (err, data) {
  if (err) ppJson(err);
  // an error occurred
  else ppJson(data); // successful response
});
```
