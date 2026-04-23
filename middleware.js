import { next } from '@vercel/functions';

export const config = {
  matcher: ['/admin/:path*'],
};

const TRUSTED_HOSTS = new Set([
  'vkron.com.br',
  'www.vkron.com.br',
  'localhost:3000',
  '127.0.0.1:3000',
]);

const BLOCKED_HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acesso restrito</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Arial, sans-serif;
        background: #f5f7fb;
        color: #10213a;
      }
      main {
        max-width: 560px;
        background: white;
        border: 1px solid #d9e1ef;
        border-radius: 18px;
        padding: 32px;
        box-shadow: 0 18px 60px rgba(6, 75, 156, 0.08);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.9rem;
      }
      p {
        line-height: 1.6;
        margin: 0 0 12px;
      }
      strong {
        color: #064b9c;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Area administrativa protegida</h1>
      <p>O acesso ao <strong>/admin</strong> exige autenticacao pelo Cloudflare Zero Trust.</p>
      <p>Entre usando o dominio oficial protegido pelas politicas do Cloudflare Access e pelo dispositivo conectado ao WARP.</p>
    </main>
  </body>
</html>`;

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  const cookieHeader = request.headers.get('cookie') || '';
  const hasAccessHeader = Boolean(
    request.headers.get('cf-access-jwt-assertion') ||
    request.headers.get('cf-access-authenticated-user-email')
  );
  const hasAccessCookie = /(?:^|;\s*)CF_Authorization=/.test(cookieHeader);
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  if ((TRUSTED_HOSTS.has(host) && (hasAccessHeader || hasAccessCookie)) || isLocal) {
    return next({
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  }

  return new Response(BLOCKED_HTML, {
    status: 403,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
      pragma: 'no-cache',
      'x-robots-tag': 'noindex, nofollow, noarchive',
    },
  });
}
