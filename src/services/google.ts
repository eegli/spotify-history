import { auth, drive } from '@googleapis/drive';
import config from '../config';

const oAuth2Client = new auth.OAuth2(
  config.GOOGLE.client_id,
  config.GOOGLE.client_secret
);

oAuth2Client.setCredentials({ refresh_token: config.GOOGLE.refresh_token });

export const googleDrive = drive({ version: 'v3', auth: oAuth2Client });
