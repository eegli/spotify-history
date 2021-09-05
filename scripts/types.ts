// Shared type definitions for both client and server Using a
// namespace eliminates and referencing it eliminates the need for an
// import

namespace TokenServer {
  export type Credentials = Record<
    'clientId' | 'clientSecret' | 'state',
    string
  >;
  // Returned from Spotify
  export type TokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  };

  export type TokenSuccess = TokenResponse & { dateObtained: string };
}
