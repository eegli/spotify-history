import pino, { stdSerializers } from 'pino';
export default pino({
  name: 'spotify-history',
  serializers: {
    cause: stdSerializers.err,
  },
});
