import authenticate, { UserConfig } from 'spotify-auth-token';
import { read } from './utils';

const credentials = read<UserConfig>('.secrets/credentials_spotify.json');

authenticate({
  clientId: credentials.clientId,
  clientSecret: credentials.clientSecret,
  port: 3000,
  outDir: '.secrets',
  fileName: 'token_spotify',
  scopes: 'user-read-recently-played',
});
