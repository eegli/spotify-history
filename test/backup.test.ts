import { Context, EventBridgeEvent } from 'aws-lambda';
import { GaxiosPromise, MethodOptions } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { backupHandler as handler } from '../src/';
import { backupHistory } from '../src/routes/backup';
import { googleDrive } from '../src/services/google';
import { driveCreateResponse, driveListResponse } from './payloads';

// Fake history response, length 1
jest.mock('../src/routes/history', () => {
  return {
    dynamoGetWeeklyHistory: jest.fn().mockImplementation(() => mockDynamoData),
  };
});
// Mock the drive client
jest.mock('../src/services/google');

const mockDynamoData = [{ music: true, tests: 'working!' }];

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

/* Alternatively to jest.spyOn, use ts-jest's "mocked" */

/* const mockDrive = mocked(googleDrive, true);
const mockCreate = mockDrive.files
  .create as unknown as jest.MockedFunction<DriveCreateSpy>;
mockCreate.mockResolvedValue(driveCreateResponse); */

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

    await backupHistory({ data, fileName, folderName });
    expect(driveCreateSpy).toHaveBeenCalledTimes(1);
  });

  it('returns backup information', async () => {
    const data = { test: true };
    const fileName = 'file';
    const folderName = 'folder';

    const res = await backupHistory({ data, fileName, folderName });

    expect(res.data).toHaveProperty('size');
    expect(res.data).toHaveProperty('webViewLink');
  });
});
