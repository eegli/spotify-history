import Hello from './module/hello';

import { ScheduledHandler } from 'aws-lambda';

import { config } from './config';
const { env } = process;

import mongoose, { ConnectOptions } from 'mongoose';

const pw = env.MONGO_PW || '';
const user = env.MONGO_USER || '';

const m = new mongoose.Mongoose();
const options: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: config.dbName,
  serverSelectionTimeoutMS: 5000,
};

async function run(): Promise<void> {
  try {
    await m.connect(
      `mongodb+srv://${user}:${pw}@spotify-history-stg.rfb2f.mongodb.net/?retryWrites=true&w=majority`,
      options
    );
    const db = m.connection.collection('movies');
    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await db.findOne(query);
    console.log(movie);
  } catch (err) {
    throw new Error(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await m.disconnect();
  }
}

export const handler: ScheduledHandler = async (
  event,
  context,
  callback
): Promise<void> => {
  run()
    .then(() => callback(null))
    .catch(err => callback(new Error(err)));

  /*   console.info(Hello + `, current env is: ${process.env.STAGE}`);
  console.warn(`Available in both prod and stg: ${process.env.PUBLIC_TEST}`);
  console.log('EVENT' + JSON.stringify(event, null, 2));
  console.log('CONTEXT' + JSON.stringify(context, null, 2)); */
};
