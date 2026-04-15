export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      const errorPayload = JSON.stringify({ error: data.error || 'no_token' });
      res.setHeader('Content-Type', 'text/html');
      res.send(renderPage('error', errorPayload));
      return;
    }

    const successPayload = JSON.stringify({
      token: data.access_token,
      provider: 'github',
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(renderPage('success', successPayload));
  } catch (err) {
    res.status(500).send('Auth error: ' + err.message);
  }
}

function renderPage(status, payload) {
  return `<!doctype html><html><body><script>
  (function() {
    function send(msg) {
      window.opener && window.opener.postMessage(msg, '*');
    }
    window.addEventListener('message', function(e) {
      if (e.data === 'authorizing:github') {
        send('authorization:github:${status}:${payload.replace(/'/g, "\\'")}');
      }
    });
    send('authorizing:github');
    send('authorization:github:${status}:${payload.replace(/'/g, "\\'")}');
    setTimeout(function() { window.close(); }, 1000);
  })();
  </script><p>Autenticando... pode fechar esta janela.</p></body></html>`;
}
