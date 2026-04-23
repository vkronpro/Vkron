# Cloudflare Zero Trust para `/admin`

Este projeto foi preparado para exigir acesso via Cloudflare Zero Trust no caminho `/admin`.

## O que foi ajustado no repositório

- `admin/config.yml`
  - `base_url` agora usa `https://vkron.com.br`
- `middleware.js`
  - bloqueia `/admin` quando os headers do Cloudflare Access nao estao presentes
- `vercel.json`
  - desativa cache e indexacao em `/admin` e `/api`

## Configuracao no Cloudflare

1. Em `DNS`, confirme que o dominio usado no admin aponta para a Vercel.
2. Em `Zero Trust` -> `Access` -> `Applications`, crie uma aplicacao do tipo `Self-hosted`.
3. Use como dominio protegido:
   - `vkron.com.br/admin*`
   - ou `www.vkron.com.br/admin*`
4. Em `Policies`, crie uma regra `Allow`.
5. Exija os usuarios desejados por email, grupo ou dominio.
6. Se quiser forcar dispositivo confiavel, habilite requisito de `WARP`.

## Recomendacao de politica

- Regra 1: permitir somente emails autorizados
- Regra 2: exigir dispositivo com WARP conectado
- Regra 3: opcionalmente restringir por pais ou IP

## Observacao importante

Sem a aplicacao do Cloudflare Access ativa para `/admin`, o middleware da Vercel vai negar acesso com `403`.
