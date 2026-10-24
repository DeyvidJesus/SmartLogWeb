# Publicação de produção

O workflow `Validate and publish SmartLog` testa e compila o Web e o app ARM64
em cada PR. Após o merge em `master`, publica o mesmo artefato, junto à Function
da API, em https://smartlog-next-2026.netlify.app. Também permite execução manual
em `master` pelo GitHub Actions.

Antes do merge, configure o secret `NETLIFY_AUTH_TOKEN` no environment
`production` ou no repositório SmartLogWeb. O token precisa acessar o site
`2e4e6ab4-bb98-4100-80db-4a074a4ecb66` na conta Netlify existente.
As variáveis Firebase e Gemini já existentes no site continuam no Netlify;
o workflow não sobrescreve essas variáveis.

Se os repositórios irmãos forem privados, configure também
`SMARTLOG_REPOSITORY_TOKEN` com acesso de leitura a SmartLogAPI e Smartlog.
Sem ele, o checkout padrão só consegue ler repositórios irmãos públicos.

O workflow fixa as revisões validadas da API e do app, evitando publicar uma
revisão nova desses repositórios sem revisão. Atualize os dois checkouts da API
e o checkout do app no YAML quando houver uma nova versão aprovada.

O APK mantém a configuração de assinatura existente do app: chave de debug.
A instalação sobre um APK anterior depende de usar o mesmo certificado.
A distribuição em uma loja e atualizações estáveis precisam da chave de
assinatura original; ela não está neste workspace. O workflow não altera
contas, regras Firestore ou dados comerciais.

A etapa final verifica o SHA-256 do HTML e APK publicados, as rotas públicas e
o endpoint público da API. O artefato fica disponível no Actions por 14 dias,
inclusive se o deploy falhar. A disponibilidade completa de GPS, câmera e
autenticação deve ser conferida também em aparelho Android.

O design da landing page não é alterado por esta configuração.

## Comprovantes, ocorrências e acompanhamento

Esta versão fixa os commits `f5411a3` da API Netlify e `e23c8a3` do app 1.1.0.
O pipeline testa os contratos da API e o cliente Flutter por HTTP antes de gerar
o APK. Os três repositórios devem ser revisados em conjunto; faça merge dos PRs
da API e do app antes do PR Web, que dispara a publicação completa.

O novo APK utiliza endpoints que só estarão disponíveis após esse deploy.
Os novos dados passam pela API; não é preciso publicar novas regras Firestore
ou configurar um novo serviço de armazenamento. Fotos e assinatura são limitadas
e persistidas em documentos acessados pelo servidor.

No painel, use **Ocorrências** para atender os registros enviados pelo motorista
e **Entregas → Detalhes** para ver comprovantes e gerar/revogar links de acompanhamento.
O app do cliente também permite consultar o comprovante e gerar o link.
A página `/acompanhar/:token` é pública para quem possui o link, que expira em sete dias.

Os fluxos foram exercitados com dados sintéticos, incluindo o cliente Flutter real,
o handler HTTP da API e o dashboard no Chromium. Câmera, GPS e instalação em
aparelho físico continuam sendo parte do ensaio antes do uso operacional.
