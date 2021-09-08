/// <reference path="./types.ts"/>
import express from 'express';
import open from 'open';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { read } from './utils';

// Port must correspond to the port set in the Spotify app
const port = 3000;
const scopes =
  'user-read-email user-top-read user-library-read user-read-recently-played';

const TOKEN_PATH = '.secrets/token_spotify.json';
const CREDENTIALS_PATH = '.secrets/credentials_spotify.json';

const credentials = read<TokenScripts.SpotifyCreds>(CREDENTIALS_PATH);

const { client_id, client_secret } = credentials;
const state = nanoid(12);

if (!client_id || !client_secret) {
  throw new Error('Did you forget to pass in a client id/secret?');
}

const app = express();
app.use(express.json());

// Get compiled client script
const script = fs.readFileSync(__dirname + '/../browser/script.js', 'utf8');

// This will be sent to the client
const template = `<html><body><script>${script}</script></body></html>`;

const spotifyUrl = () => {
  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=code';
  url += '&show_dialog=true';
  url += '&state=' + encodeURIComponent(state);
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&redirect_uri=' + encodeURIComponent('http://localhost:3000');
  url += '&scope=' + encodeURIComponent(scopes);
  return url;
};

open(spotifyUrl());

app.get('/', (_, res) => {
  res.send(template);
});

app.get(
  '/credentials',
  (_, res: express.Response<TokenScripts.SpotifyTokenResponse>) => {
    res.json({ ...credentials, state });
  }
);

app.post('/submit', (req, res) => {
  const jsonData: TokenScripts.SpotifyTokenSuccess = req.body;
  if (jsonData.access_token) {
    console.log(`Success! Saved token to file`);
    jsonData.dateObtained = new Date().toLocaleString();
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(jsonData, null, 2));
    res.send('Successful! You can now close this window');
    process.exit(0);
  }
  throw new Error(
    'No token obtained.\nDid you click "cancel" in the Spotify auth window?'
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
