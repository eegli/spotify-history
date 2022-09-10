import { authorize, Options } from '@spotifly/auth-token';
import { read } from './utils';

const credentials = read<Options>('.secrets/credentials_spotify.json');

authorize({
  clientId: credentials.clientId,
  clientSecret: credentials.clientSecret,
  port: 3000,
  outDir: '.secrets',
  fileName: 'token_spotify',
  scopes: 'user-read-recently-played',
});
