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
    const r = driveCreateSpy.mock.calls[1][0]?.media?.body;
    expect(JSON.parse(r)).toMatchObject({
      count: mockDynamoData.length,
      items: mockDynamoData,
    });
  });

  it('does not create a new folder if one is present', async () => {
    const data = { test: true };
    const fileName = 'file';
    const folderName = 'folder';

    await backupHistory({ data, fileName, folderName });
    expect(driveListSpy.mock.calls[0][0]).toMatchSnapshot();
    expect(driveCreateSpy.mock.calls[0][0]).toMatchSnapshot();
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
