(async () => {
  const REDIRECT_URL = 'http://localhost:3000';
  const refreshTokenUrl = 'https://accounts.spotify.com/api/token';
  const localGetCredentialsUrl = 'http://localhost:3000/credentials';
  const localSubmitTokenUrl = 'http://localhost:3000/submit';

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const receivedState = urlParams.get('state');

  if (code) {
    let clientId: string;
    let clientSecret: string;
    let state: string;

    try {
      const credentialsRes = await fetch(localGetCredentialsUrl, {
        credentials: 'same-origin',
      });
      const credentials = await credentialsRes.json();

      if (credentials.state !== receivedState) {
        throw Error("States don't match");
      }

      clientId = credentials.clientId;
      clientSecret = credentials.clientSecret;
      state = credentials.state;

      const params = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URL,
      };

      const tokenParams = new URLSearchParams();
      for (const prop in params) {
        tokenParams.set(prop, params[prop]);
      }

      const tokenRes = await fetch(refreshTokenUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + window.btoa(clientId + ':' + clientSecret),
        },
        body: tokenParams,
      });
      const token = await tokenRes.json();
      if (token.access_token) {
        const info = document.getElementById('info');

        if (info) {
          info.innerHTML =
            'Authentication successful. You can now close this window';
        }

        const successRes = await fetch(localSubmitTokenUrl, {
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
    } catch {}
  }
})();
