import { google } from 'googleapis';
import fs from 'fs';
import config from '../config';

export async function backupHistory() {
  const TEST_JSON = 'test/payloads/spotify-history.json';

  const clientId = config.GOOGLE.client_id;
  const clientSecret = config.GOOGLE.client_secret;
  const refreshToken = config.GOOGLE.refresh_token;

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

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
}
