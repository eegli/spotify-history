import {
  instance,
  GetRefreshTokenParams,
  GetHistoryParams,
  GetHistoryResponse,
  GetRefreshTokenResponse,
  Endpoints,
} from '../api';
import config from '../config';

export const getRefreshToken = async (): Promise<string> => {
  const client = instance<GetRefreshTokenParams>({
    client_id: config.sptClientId,
    client_secret: config.sptClientSecret,
    grant_type: 'refresh_token',
    refresh_token: config.sptRefreshToken,
  });
  const res = await client.post<GetRefreshTokenResponse>(
    Endpoints.RefreshToken
  );
  return res.data.access_token;
};

export const getHistory = async (
  token: string,
  params: GetHistoryParams
): Promise<GetHistoryResponse> => {
  const client = instance<GetHistoryParams>(params);
  const res = await client.get<GetHistoryResponse>(Endpoints.GetHistory, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
