/// <reference path="./types.ts"/>

(async (): Promise<void> => {
  // This must correspond to the redirect url set in the Spotify developer application
  const local = 'http://localhost:3000';

  const credentialsURL = `${local}/credentials`;
  const postToken = `${local}/submit`;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const receivedState = urlParams.get('state');

  if (code) {
    const getCredentials = async (): Promise<TokenServer.Credentials> => {
      const result = await fetch(credentialsURL, {
        credentials: 'same-origin',
      });

      return result.json();
    };

    const { clientId, clientSecret, state } = await getCredentials();

    if (state !== receivedState) {
      throw Error("States don't match");
    }

    const params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: local,
    };

    const tokenParams = new URLSearchParams();
    for (const prop in params) {
      tokenParams.set(prop, params[prop]);
    }

    const getToken = async (): Promise<TokenServer.TokenResponse> => {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + window.btoa(clientId + ':' + clientSecret),
        },
        body: tokenParams,
      });
      return res.json();
    };
    const token = await getToken();

    if (token.access_token) {
      const info = document.getElementById('info');

      if (info) {
        info.innerHTML =
          'Authentication successful. You can now close this window';
      }

      const successRes = await fetch(postToken, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          ...token,
        }),
      });
      const successMessage = await successRes.text();
      const node = document.createElement('h1');
      node.innerHTML = successMessage;
      document.body.appendChild(node);
    }
  }
})();
