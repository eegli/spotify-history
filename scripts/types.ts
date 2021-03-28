namespace TokenServer {
  // Returned from local server
  export type CredentialsRes = {
    clientId: string;
    clientSecret: string;
    state: string;
  };
  // Returned from Spotify
  export type TokenRes = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  };
}
