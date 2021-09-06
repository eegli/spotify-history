import { google } from 'googleapis';
import fs from 'fs';

type Credentials = {
  installed: {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
  };
};

type Token = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expiry_date: number;
};

(async () => {
  const CREDENTIALS_PATH = 'google_credentials.json';
  const TOKEN_PATH = 'token_google.json';
  const TEST_JSON = 'test/payloads/spotify-history.json';

  const credentials: Credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, 'utf-8')
  );
  const token: Token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

  const { client_secret, client_id } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);

  oAuth2Client.setCredentials(token);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  let folderId: string;

  const folders = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    q: "mimeType = 'application/vnd.google-apps.folder'",
  });

  if (folders?.data?.files?.length && folders.data.files[0]) {
    folderId = folders.data.files[0].id || '';
  } else {
    const folder = await drive.files.create({
      requestBody: {
        name: 'SpotifyHistory',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    folderId = folder.data.id || '';
  }
  console.log(folderId);
  const json = {
    mineType: 'application/json',
    body: fs.createReadStream(TEST_JSON),
  };
  const now = new Date().toISOString();

  const file = await drive.files.create({
    requestBody: {
      name: 'test-file__' + now + '.json',
      parents: [folderId],
    },
    media: json,
    fields: 'id',
  });

  console.log(file.data);
})();
