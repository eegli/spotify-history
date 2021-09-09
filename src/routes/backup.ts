import { drive_v3 } from 'googleapis';
import { drive } from '../services/google';
import { PickType } from '../utils';

type RequestBody = PickType<
  drive_v3.Params$Resource$Files$Create,
  'requestBody'
>;

export type BackupParams = {
  data: unknown;
  fileName: string;
  folderName: string;
};

export const backupHistory = async ({
  data,
  fileName,
  folderName,
}: BackupParams) => {
  let folderId = '';

  // List all folders that this API client has already created
  const folders = await drive.files.list({
    pageSize: 10,
    // Specify what fields we want to have in the response
    fields: 'files(id, name)',
    q: "mimeType = 'application/vnd.google-apps.folder'",
  });

  // Check if the folder with the given name already exists
  if (folders.data.files?.length) {
    const existingFolderIdx = folders.data.files.findIndex(
      f => f.name === folderName
    );

    if (existingFolderIdx > -1) {
      folderId = folders.data.files[existingFolderIdx].id || '';
    }
  }

  // Folder does not exist, create one
  if (!folderId) {
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    folderId = folder.data.id || '';
  }

  const requestBody: RequestBody = {
    name: fileName + '.json',
    parents: [folderId],
  };

  return drive.files.create({
    requestBody,
    media: {
      mimeType: 'application/json',
      // Change to JSON.stringify(data) for more compact files
      body: JSON.stringify(data, null, 2),
    },
    fields: 'size,webViewLink',
  });
};
