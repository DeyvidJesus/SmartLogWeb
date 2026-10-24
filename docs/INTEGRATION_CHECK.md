# Verificação da integração — 24/10/2026

O relato de indisponibilidade da IA não se reproduziu nas duas verificações ao vivo. O usuário também confirmou que voltou a funcionar. Não foi necessário substituir a chave nem o modelo Gemini.

## Resultado observado

As execuções [40115356468](https://github.com/DeyvidJesus/SmartLogWeb/actions/runs/40115356468) e [40115639163](https://github.com/DeyvidJesus/SmartLogWeb/actions/runs/40115639163) concluíram com sucesso:

- A API pública retorna JSON da Function Netlify e rejeita sessões anônimas.
- As identidades Firebase de demonstração ADMIN, MOTORISTA e CLIENTE autenticam e consultam seus pedidos persistidos.
- Os três perfis recebem resposta real com `provedor: gemini`, sem `degradado`.
- A configuração do Gemini está disponível no escopo `functions`, com modelo `gemini-3.1-flash-lite`.
- O APK publicado corresponde ao artefato do último build de produção.

Os testes locais exercitam o cliente HTTP real do Flutter até a API: registro de ocorrência, comprovante, consulta administrativa, acompanhamento público e pergunta ao assistente sobre o status persistido. Nesse teste local, somente o provedor de linguagem é determinístico; a disponibilidade do Gemini é verificada separadamente em produção. O dashboard tem testes do formulário do assistente com o interceptor de autenticação real, incluindo sucesso e limitação de uso.

## Falha independente no workflow de produção

O workflow anterior falhava comparando o SHA-256 do `index.html` servido com o HTML do build. Na conferência ao vivo, esses arquivos diferem, embora os nomes dos bundles e o APK correspondam à publicação esperada. O HTML pode ser transformado pela hospedagem.

A verificação passa a conferir as referências de entrada no HTML, o SHA-256 de **todos os arquivos JS/CSS compilados, incluindo rotas lazy**, o SHA-256 do APK, as rotas SPA, os metadados JSON da API e a rejeição de links inválidos de acompanhamento. Os testes da verificação aceitam HTML reformatado e continuam rejeitando outro build, bundle alterado ou APK incorreto. Isso não altera a aplicação nem o design da landing page.

Essa falha de verificação, isoladamente, não comprova a causa do erro transitório relatado na IA.

## Repetir o diagnóstico

Após o merge, execute manualmente **Check production integration and deployment** em GitHub Actions. O workflow localiza um artefato recente de produção ainda disponível e compara os arquivos publicados. O diagnóstico completo usa `NETLIFY_AUTH_TOKEN` do ambiente `production` para ler a configuração existente e testar Firebase e Gemini. Não salva credenciais nem tokens em arquivos, logs ou artefatos. O diagnóstico usa contas de demonstração existentes, sem modificar pedidos, rotas, senhas ou perfis.

O resumo informa status HTTP, presença da configuração, perfil e provedor. Erros brutos dos SDKs e corpos de respostas do provedor não são publicados. A execução automática na branch de correção verifica somente o deploy; novas chamadas reais ao Gemini exigem o disparo manual, evitando consumir quota desnecessariamente.
