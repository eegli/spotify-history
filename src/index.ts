import Hello from './module/hello';
import { ScheduledHandler } from 'aws-lambda';

export const handler: ScheduledHandler = async (
  event,
  context
): Promise<void> => {
  console.info(Hello + `, current env is: ${process.env.STAGE}`);
  console.warn(`Available in both prod and stg: ${process.env.PUBLIC_TEST}`);
  console.log('EVENT' + JSON.stringify(event, null, 2));
  console.log('CONTEXT' + JSON.stringify(context, null, 2));
};
