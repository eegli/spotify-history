namespace TokenServer {
  export type Credentials = {
    clientId: string;
    clientSecret: string;
    state: string;
  };
  // Returned from Spotify
  export type Token = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  };
}
