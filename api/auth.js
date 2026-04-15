export default function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: Math.random().toString(36).substring(7),
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
