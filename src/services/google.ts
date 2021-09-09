import { google } from 'googleapis';
import config from '../config';

const oAuth2Client = new google.auth.OAuth2(
  config.GOOGLE.client_id,
  config.GOOGLE.client_secret
);

oAuth2Client.setCredentials({ refresh_token: config.GOOGLE.refresh_token });

export const drive = google.drive({ version: 'v3', auth: oAuth2Client });
