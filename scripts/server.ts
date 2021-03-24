import { createServer, IncomingMessage, ServerResponse } from 'http';
import open from 'open';
import fs from 'fs';
import { nanoid } from 'nanoid';

const host = 'localhost';
const port = 3000;

const scopes =
  'user-read-email user-top-read user-library-read user-read-recently-played';
const clientId = process.env.CLIENT_ID || '';
const clientSecret = process.env.CLIENT_SECRET || '';
const state = nanoid(12);

if (!clientId || !clientSecret) {
  throw Error('Did you forget to pass in a client id/secret?');
}

const script = fs.readFileSync(__dirname + '/../public/script.js', 'utf8');
const template = `<html><body><script>${script}</script></body></html>`;

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

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method == 'GET' && req.url === '/credentials') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ clientId, clientSecret, state }));
    res.end();
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';

    req.on('data', function (data) {
      body += data;
    });

    req.on('end', function () {
      const data = JSON.parse(body);
      if (data.access_token) {
        console.log(`Saved token to file`);
        data.dateObtained = new Date().toLocaleString();
        fs.writeFileSync(
          __dirname + '/../token.json',
          JSON.stringify(data, null, 2)
        );
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Successful! You can now close this window');
        res.end();
        process.exit(0);
      }
      throw Error(
        'No token obtained.\nDid you click "cancel" in the Spotify auth window?'
      );
    });
  } else if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(template);
    res.end();
  }
});
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
