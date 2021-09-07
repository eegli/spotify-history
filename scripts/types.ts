// Shared type definitions for all scripts sing a namespace eliminates
// the need for an import

namespace TokenScripts {
  // Spotify credentials file
  export type SpotifyCreds = {
    client_id: string;
    client_secret: string;
  };

  // Google Credentials file
  export type GoogleCreds = {
    installed: {
      client_id: string;
      project_id: string;
      auth_uri: string;
      token_uri: string;
      auth_provider_x509_cert_url: string;
      client_secret: string;
      redirect_uris: string[];
    };
  };

  // Returned from Spotify
  export type SpotifyToken = {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    refresh_token: string;
    scope: string;
  };

  // Returned from Google
  export type GoogleToken = {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: 'Bearer';
    expiry_date: number;
  };

  // For the local token server
  export type SpotifyTokenResponse = Omit<SpotifyCreds, 'scopes'> & {
    state: string;
  };
  export type SpotifyTokenSuccess = Partial<SpotifyToken> & {
    dateObtained: string;
  };
}
