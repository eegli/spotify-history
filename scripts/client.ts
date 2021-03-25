(async (): Promise<void> => {
  // This must correspond to the redirect url set in the Spotify developer application
  const local = 'http://localhost:3000';

  const getCredentials = `${local}/credentials`;
  const postToken = `${local}/submit`;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const receivedState = urlParams.get('state');

  if (code) {
    let clientId: string;
    let clientSecret: string;
    let state: string;

    try {
      const credentialsRes = await fetch(getCredentials, {
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
        redirect_uri: local,
      };

      const tokenParams = new URLSearchParams();
      for (const prop in params) {
        tokenParams.set(prop, params[prop]);
      }

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
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
    } catch {}
  }
})();
