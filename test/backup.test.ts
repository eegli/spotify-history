import { Context, EventBridgeEvent } from 'aws-lambda';
import { GaxiosPromise, MethodOptions } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { handler } from '../src/handler.backup';
import { backupHistory } from '../src/routes/backup';
import { googleDrive } from '../src/services/google';
import {
  driveCreateResponse,
  driveListResponse,
  dynamoBackupData,
} from './payloads';

// Fake the response from dynamo
jest.mock('../src/routes/history', () => ({
  dynamoGetHistoryRange: jest.fn().mockImplementation(() => dynamoBackupData()),
}));
// Mock the drive client
jest.mock('../src/services/google');

// Setting the right method overloads manually
type DriveListSpy = (
  params?: drive_v3.Params$Resource$Files$List,
  options?: MethodOptions
) => GaxiosPromise<drive_v3.Schema$FileList>;

type DriveCreateSpy = (
  params?: drive_v3.Params$Resource$Files$Create,
  options?: MethodOptions
) => GaxiosPromise<drive_v3.Schema$File>;

const driveListSpy = jest.spyOn(
  googleDrive.files,
  'list'
) as unknown as jest.MockedFunction<DriveListSpy>;

const driveCreateSpy = jest.spyOn(
  googleDrive.files,
  'create'
) as unknown as jest.MockedFunction<DriveCreateSpy>;

/* ____________ */

/* Alternatively to jest.spyOn */

const mockCreate = googleDrive.files
  .create as unknown as jest.MockedFunction<DriveCreateSpy>;
mockCreate.mockResolvedValue(driveCreateResponse);

/* ____________ */

driveListSpy.mockResolvedValue(driveListResponse);
driveCreateSpy.mockResolvedValue(driveCreateResponse);

beforeEach(() => {
  driveListSpy.mockClear();
  driveCreateSpy.mockClear();
});

describe('Backup handler', () => {
  jest.useFakeTimers('modern').setSystemTime(new Date(1996, 3, 21));

  it('creates a backup', async () => {
    await handler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(driveListSpy).toHaveBeenCalledTimes(1);
    expect(driveCreateSpy).toHaveBeenCalledTimes(2);
    expect(driveListSpy.mock.calls[0][0]).toMatchSnapshot();
    expect(driveCreateSpy.mock.calls[0][0]).toMatchSnapshot('creates folder');
    expect(driveCreateSpy.mock.calls[1][0]).toMatchSnapshot('creates file');
  });

  it('does not create a new folder if one is present', async () => {
    const data = { test: true };
    const fileName = 'file';
    const folderName = 'folder';
    const meta = {};

    await backupHistory({ data, fileName, folderName, meta });
    expect(driveCreateSpy).toHaveBeenCalledTimes(1);
  });

  it('returns backup information', async () => {
    const data = { test: true };
    const fileName = 'file';
    const folderName = 'folder';
    const meta = {};

    const res = await backupHistory({ data, fileName, folderName, meta });

    expect(res.data).toHaveProperty('size');
    expect(res.data).toHaveProperty('webViewLink');
  });
});
