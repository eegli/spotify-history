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
      if (data) {
        console.log(`Saved token to file`);
        data.dateObtained = new Date().toLocaleString();
        fs.writeFileSync(
          __dirname + '/../token.json',
          JSON.stringify(data, null, 2)
        );
        process.exit(0);
      }
      console.log(
        'An error has occured, no token obtained.\nDid you click "cancel" in the Spotify auth window?'
      );
      process.exit(1);
    });
  } else if (req.method === 'GET') {
    fs.readFile(__dirname + '/../public/index.html', (_, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data);
      return res.end();
    });
  }
});
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
