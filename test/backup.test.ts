import { Context, EventBridgeEvent } from 'aws-lambda';
import { GaxiosPromise, MethodOptions } from 'googleapis-common';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { backup as backupHandler } from '../src/index';
import { backupHistory } from '../src/routes/backup';
import { drive } from '../src/services/google';
import { fakeGaxiosRes } from './payloads';

jest.mock('../src/services/google');

// Fake history response, length 1
jest.mock('../src/routes/history', () => {
  return {
    dynamoGetWeeklyHistory: jest.fn().mockReturnValue([{ music: true }]),
  };
});

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

const mockListResponse = fakeGaxiosRes<drive_v3.Schema$FileList>({
  files: [{ name: 'folder', id: 'id' }],
});

const mockCreateResponse = fakeGaxiosRes<drive_v3.Schema$File>({
  size: '69',
  webViewLink: 'http://example.com',
});

driveListSpy.mockResolvedValue(mockListResponse);
driveCreateSpy.mockResolvedValue(mockCreateResponse);

beforeEach(() => {
  driveListSpy.mockClear();
  driveCreateSpy.mockClear();
});

describe('Backup handler', () => {
  it('creates the history', async () => {
    await backupHandler(
      {} as EventBridgeEvent<'Scheduled Event', any>,
      {} as Context,
      () => {}
    );
    expect(driveCreateSpy).toHaveBeenCalledTimes(2);
    expect(driveListSpy).toHaveBeenCalledTimes(1);
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
