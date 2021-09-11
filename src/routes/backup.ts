import { googleDrive } from '../services/google';

export type BackupParams<T = unknown> = {
  fileName: string;
  folderName: string;
  meta: Record<string, string | number>;
  data: T;
};

export const backupHistory = async ({
  data,
  meta,
  fileName,
  folderName,
}: BackupParams) => {
  let folderId = '';

  // List all folders that this API client has already created
  const folders = await googleDrive.files.list({
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
    const folder = await googleDrive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    folderId = folder.data.id || '';
  }

  const body = {
    meta,
    items: data,
  };

  return googleDrive.files.create({
    requestBody: {
      name: fileName + '.json',
      parents: [folderId],
    },
    media: {
      mimeType: 'application/json',
      // Change to JSON.stringify(body) for more compact files
      body: JSON.stringify(body, null, 2),
    },
    fields: 'size,webViewLink',
  });
};
