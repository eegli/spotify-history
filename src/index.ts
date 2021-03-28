import Hello from './module/hello';
import fetch from 'node-fetch';
import { ScheduledHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

export const handler: ScheduledHandler = async (
  event,
  context,
  callback
): Promise<void> => {
  const s3 = new AWS.S3();
  const bucketName = process.env.BUCKET_NAME || 'BUCKET_NAME';
  // Call S3 to list the buckets
  s3.listBuckets(function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data.Buckets);
    }
  });
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
    .then(json => {
      const params = {
        Key: `Test`,
        Body: JSON.stringify(json),
        Bucket: bucketName,
        ContentType: 'application/json',
      };
      return s3.putObject(params).promise();
    })
    .then(() => {
      console.log('The backup has been done');
      callback(null);
    })
    .catch(error => {
      console.log('Error: ', error);
      callback(new Error(error));
    });

  /*   console.info(Hello + `, current env is: ${process.env.STAGE}`);
  console.warn(`Available in both prod and stg: ${process.env.PUBLIC_TEST}`);
  console.log('EVENT' + JSON.stringify(event, null, 2));
  console.log('CONTEXT' + JSON.stringify(context, null, 2)); */
};
