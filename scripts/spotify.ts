import auth, { UserConfig } from 'spotify-auth-token';
import { read } from './utils';

const credentials = read<UserConfig>('.secrets/credentials_spotify.json');

auth({
  clientId: credentials.clientId,
  clientSecret: credentials.clientSecret,
  port: 3000,
  outDir: '.secrets',
  outFileName: 'token_spotify',
  scopes: 'user-read-recently-played',
});
