> Publicação atual: https://smartlog-next-2026.netlify.app — configuração e ensaio no [guia Netlify](../SmartLogAPI/docs/NETLIFY.md). Os procedimentos Google/Cloud Run abaixo são alternativas históricas.

> Integração atual: login em /login com Firebase, dados compartilhados com o app e assistente Gemini em /admin/assistente. Consulte ../SmartLogAPI/docs/INTEGRACAO.md no workspace integrado.

# SmartLog Web

[![CI](https://github.com/DeyvidJesus/SmartLogWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/DeyvidJesus/SmartLogWeb/actions/workflows/ci.yml)

Painel web administrativo do SmartLog, sistema de gestão logística. Consome a
[SmartLogAPI](https://github.com/DeyvidJesus/SmartLogAPI) (Spring Boot) e permite ao perfil
`ADMIN` de uma empresa acompanhar e gerenciar a operação.

## Funcionalidades

- **Página inicial** (`/home`) de apresentação da plataforma, com acesso ao painel.
- **Dashboard** (`/admin/dashboard`): indicadores calculados a partir das entregas, rotas,
  motoristas, clientes e veículos retornados pela API (totais, pendentes, em trânsito,
  entregues, proporção de entregas concluídas) e lista de entregas recentes. O mapa operacional mostra o último GPS real enviado pelo app, com horário. A operação é consultada a cada 5 segundos.
- **Assistente** (/admin/assistente): consulta a API e o Gemini com os dados autorizados. A chave fica no servidor.
- **Entregas** (`/admin/entregas`): listagem com filtros, criação e atualização de status.
- **Rotas**, **Motoristas** e **Clientes**: listagem, consulta e cadastro.
- **Veículos** (`/admin/veiculos`): gestão da frota (cadastro, edição e exclusão).
- Consulta de endereço por CEP via [ViaCEP](https://viacep.com.br) nos formulários.
- Interceptor HTTP que envia o `Authorization: Bearer` e traduz erros da API em mensagens.

## Stack

- Angular 21 (componentes standalone, signals, roteamento)
- TypeScript 5.9
- Leaflet (mapa)
- Vitest + jsdom (testes unitários via `ng test`)
- Node.js 22 LTS / npm 10

## Executar junto com a SmartLogAPI

O painel possui login Firebase. O fluxo abaixo é uma alternativa local de demonstração com o atalho de
autenticação da API, que só existe no perfil `dev` dela.

1. Suba a API com o perfil `dev` (veja o
   [README da API](https://github.com/DeyvidJesus/SmartLogAPI#executar-localmente-perfil-dev)):

   ```bash
   # no repositório SmartLogAPI
   SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
   ```

2. Suba o painel:

   ```bash
   npm ci
   npm start   # ng serve em http://localhost:4200
   ```

O `ng serve` usa `proxy.conf.json` para encaminhar `/api` e `/actuator` para
`http://localhost:8080`, então não é preciso configurar CORS em desenvolvimento.

### Token de desenvolvimento

| Onde | Nome | Valor padrão |
| --- | --- | --- |
| SmartLogWeb | `devAuthToken` em `src/environments/environment.development.ts` | `smartlog-dev-token` |
| SmartLogAPI | `smartlog.security.dev-auth.token` (`application-dev.yml`, variável `SMARTLOG_DEV_AUTH_TOKEN`) | `smartlog-dev-token` |

Os dois valores precisam ser iguais. O token autentica como `ADMIN` da `empresa-001`.
No build de produção (`environment.ts`) o `devAuthToken` é vazio, e a API recusa esse
token fora do perfil `dev`. Um token salvo em `localStorage` (`smartlog_token`) tem
prioridade sobre o valor do environment.

## Testes e build

```bash
npm test -- --watch=false   # Vitest em modo headless
npm run build               # build de produção em dist/SmartLogWeb
```

O mesmo fluxo (`npm ci`, testes e build) roda no GitHub Actions a cada push e pull request.

## Estrutura

```text
src/app
├── components   # header, sidebar e toast
├── layouts      # layout do painel administrativo
├── models       # tipos das respostas da API
├── pages        # home, dashboard, entregas, rotas, motoristas, clientes, veículos
└── services     # clientes HTTP da API, autenticação, interceptor, CEP e notificações
```

## Repositórios relacionados

- [SmartLogAPI](https://github.com/DeyvidJesus/SmartLogAPI) — backend REST consumido por este painel.
- [Smartlog](https://github.com/DeyvidJesus/Smartlog) — app mobile em Flutter (projeto em
  equipe), que compartilha as coleções raiz e usa esta API para status e chat.


## Firebase e validação integrada

Com os emuladores e a API no perfil emulator iniciados, execute npm start -- --configuration emulator. Esse modo usa Auth emulado, sem token dev; consulte o guia integrado.

Para Firebase real pelo Angular local, remova devAuthToken do environment de desenvolvimento e faça login com um administrador existente. O build de produção já usa Firebase real, sem token de demonstração. O cadastro administrativo é validado em /api/v1/me antes de abrir o painel.

Passaram 16 testes e o build de produção em 23/10/2026. O Leaflet mantém um aviso CommonJS. A conferência visual no navegador e o ensaio com o tablet ainda precisam ser realizados.
