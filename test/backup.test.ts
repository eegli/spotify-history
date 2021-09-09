import { Context, EventBridgeEvent } from 'aws-lambda';
import { GaxiosPromise, MethodOptions } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { backup as backupHandler } from '../src/index';
import { backupHistory } from '../src/routes/backup';
import { drive } from '../src/services/google';
import { driveCreateResponse, driveListResponse } from './payloads';

// Fake history response, length 1
jest.mock('../src/routes/history', () => {
  return {
    dynamoGetWeeklyHistory: jest.fn().mockImplementation(() => mockDynamoData),
  };
});

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
  drive.files,
  'list'
) as unknown as jest.MockedFunction<DriveListSpy>;

const driveCreateSpy = jest.spyOn(
  drive.files,
  'create'
) as unknown as jest.MockedFunction<DriveCreateSpy>;

driveListSpy.mockResolvedValue(driveListResponse);
driveCreateSpy.mockResolvedValue(driveCreateResponse);

beforeEach(() => {
  driveListSpy.mockClear();
  driveCreateSpy.mockClear();
});

describe('Backup handler', () => {
  it('creates a backup', async () => {
    await backupHandler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(driveListSpy).toHaveBeenCalledTimes(1);
    expect(driveCreateSpy).toHaveBeenCalledTimes(2);

    // Make sure drive.list is called with the right params
    expect(driveListSpy.mock.calls[0][0]).toMatchSnapshot();

    // First call to drive.create to create the folder
    expect(driveCreateSpy.mock.calls[0][0]).toMatchSnapshot();

    // Second call to drive.create to create the actual json file
    // Snapshot testing isn't possible cause of the ever changing date
    expect(
      JSON.parse(driveCreateSpy.mock.calls[1][0]?.media?.body)
    ).toMatchObject({
      count: mockDynamoData.length,
      items: mockDynamoData,
    });
    expect(driveCreateSpy.mock.calls[1][0]?.media?.mimeType).toEqual(
      'application/json'
    );
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
