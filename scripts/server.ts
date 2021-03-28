/// <reference path="./types.ts"/>
import express from 'express';
import open from 'open';
import fs from 'fs';
import { nanoid } from 'nanoid';

// Port must correspond to the port set in the Spotify app
const port = 3000;
const clientId = process.env.CLIENT_ID || '';
const clientSecret = process.env.CLIENT_SECRET || '';

const scopes =
  'user-read-email user-top-read user-library-read user-read-recently-played';
const state = nanoid(12);

if (!clientId || !clientSecret) {
  throw Error('Did you forget to pass in a client id/secret?');
}

const app = express();
app.use(express.json());
// Get compiled client script
const script = fs.readFileSync(__dirname + '/../browser/script.js', 'utf8');
// This will be sent to the client
const template = `<html><body><script>${script}</script></body></html>`;

const credentials: TokenServer.Credentials = { clientId, clientSecret, state };

const spotifyUrl = () => {
  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=code';
  url += '&show_dialog=true';
  url += '&state=' + encodeURIComponent(state);
  url += '&client_id=' + encodeURIComponent(clientId);
  url += '&redirect_uri=' + encodeURIComponent('http://localhost:3000');
  url += '&scope=' + encodeURIComponent(scopes);
  return url;
};

open(spotifyUrl());

app.get('/', (_, res) => {
  res.send(template);
});

app.get('/credentials', (_, res) => {
  res.json(credentials);
});

app.post('/submit', (req, res) => {
  const jsonData = req.body;
  if (jsonData.access_token) {
    console.log(`Success! Saved token to file`);
    jsonData.dateObtained = new Date().toISOString();
    fs.writeFileSync(
      __dirname + '/../token.json',
      JSON.stringify(jsonData, null, 2)
    );
    res.send('Successful! You can now close this window');
    process.exit(0);
  }
  throw Error(
    'No token obtained.\nDid you click "cancel" in the Spotify auth window?'
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
