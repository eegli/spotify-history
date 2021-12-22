import auth, { UserConfig } from 'spotify-auth-token';
import { read } from './utils';

const credentials = read<UserConfig>('.secrets/credentials_spotify.json');

auth({
  ...credentials,
  port: 3000,
  outDir: '.secrets',
  outFileName: 'token_spotify',
  scopes:
    'user-read-email user-top-read user-library-read user-read-recently-played',
});
