# Demonstração SmartLog no NEXT

São dez pedidos e dez rotas fictícias: quatro casos abertos para executar no tablet e seis exemplos preenchidos para explorar no painel. O número do caso aparece no código do pedido, no nome da rota e nas observações dos dois registros. A landing page mantém seu design.

## Acessos preservados

Use as mesmas senhas que já funcionam. A preparação não cria, remove ou altera contas, senhas ou perfis, inclusive o usuário inativo.

| Equipamento / papel | Conta existente |
| --- | --- |
| Notebook / administrador | `admin.next2026@example.test` |
| Tablet / quatro casos ao vivo | `motorista1.next2026@example.test` |
| Exemplos de ocorrências prontas | `motorista2.next2026@example.test` |
| Cliente / casos 01, 02, 05 e 09 | `cliente1.next2026@example.test` |
| Cliente / casos 03, 06 e 08 | `cliente2.next2026@example.test` |
| Cliente / casos 04, 07 e 10 | `cliente3.next2026@example.test` |

Painel e API: https://smartlog-next-2026.netlify.app. O APK existente já trabalha com esses dados; não é necessário reinstalar o app para renovar os cenários.

## Quatro casos para atualizar ao vivo

Entre como motorista1 no tablet e como administrador no notebook. Permita câmera e localização no tablet. Os dados de foto, assinatura e recebedor coletados ao vivo devem ser de uma simulação consentida.

| Pedido / rota | Estado inicial | Demonstração |
| --- | --- | --- |
| `ENT-NEXT-01` / `01 AO VIVO` | Em rota, 2 volumes | Inicie o GPS e confirme os 2 volumes com nome, foto e assinatura. Abra o comprovante no painel e gere o acompanhamento do cliente. |
| `ENT-NEXT-02` / `02 AO VIVO` | Pendente, 4 volumes | Altere para Em Rota. Registre entrega parcial de 3 volumes; no painel, resolva a ocorrência com orientação sobre o volume faltante e mensagem ao cliente. O pedido continua aberto. |
| `ENT-NEXT-03` / `03 AO VIVO` | Pendente, 2 volumes | Registre avaria com foto. No painel, registre a ação da loja e a mensagem ao cliente. Compare o acompanhamento público com as informações internas. |
| `ENT-NEXT-04` / `04 AO VIVO` | Pendente, 1 volume | Registre destinatário ausente. Resolva no painel com nova tentativa combinada. Mostre a mensagem no acompanhamento e revogue o link. |

Só a rota 01 começa em andamento para que o botão de GPS selecione uma única rota no tablet. Atualizar o status de uma entrega não substitui a gestão da sua rota. A tela de detalhes do painel exibe o roteiro nas observações. O app identifica cada caso pelo código do pedido e pelo nome da rota.

## Seis exemplos prontos

| Pedido | Exemplo | Estado |
| --- | --- | --- |
| `ENT-NEXT-05` | Entrega concluída, 3 volumes e comprovante ilustrativo | Entregue / rota concluída |
| `ENT-NEXT-06` | Cancelamento solicitado pelo cliente fictício | Cancelada / rota cancelada |
| `ENT-NEXT-07` | Atraso e destinatário ausente | Atrasada / ocorrência aberta |
| `ENT-NEXT-08` | Avaria com foto ilustrativa, aguardando decisão da loja | Em rota / ocorrência aberta |
| `ENT-NEXT-09` | Entrega parcial: 2 de 5 volumes | Em rota / ocorrência aberta |
| `ENT-NEXT-10` | Ausência resolvida e nova tentativa combinada | Pendente / ocorrência resolvida |

As rotas 07–10 estão pausadas. Na Central de Ocorrências há três abertas e uma resolvida. Resolver uma ocorrência não confirma a entrega. O comprovante 05 contém foto e assinatura claramente marcadas como ilustrações, sem validade comercial e sem GPS inventado.

## Preparação e backup

A manutenção é limitada à empresa `smartlog-next-demo-2026`, identificada como demonstração. Substitui somente entregas, rotas, veículos, ocorrências e links de acompanhamento dessa empresa. Os links antigos deixam de funcionar. Preserva empresas e todos os usuários. O resultado esperado é: 10 entregas, 10 rotas, 2 veículos, 4 ocorrências e nenhum link previamente compartilhado.

O workflow **Prepare NEXT demonstration cases** usa o ambiente `production` e a credencial administrativa já configurada no Netlify. Não expõe a credencial em logs, arquivos ou artefatos. Antes da gravação, salva `before.json` e `plan.json` no artefato privado `next-demo-backup-<run-id>`, disponível por 14 dias no GitHub Actions. O backup inclui os dados operacionais anteriores e uma cópia dos perfis para conferência; não inclui senhas. Após a aplicação, `result.json` confirma as contagens e a preservação dos perfis.

A substituição é uma única operação atômica, com proteção contra alterações simultâneas e um marcador de execução. Reexecutar a operação `next-fair-cases-v2` preserva os avanços já feitos nos casos. Uma nova limpeza intencional exige outro identificador de operação no disparo manual. O modo manual padrão `preview` apenas valida e gera backup, sem alterar dados.

Para recuperação administrativa, `before.json` lista os caminhos e dados dos registros anteriores. Valores especiais usam marcadores `$type` (`timestamp`, `bytes`, `geopoint`, `reference`) e devem ser convertidos para os tipos Firestore antes de uma restauração revisada. Não restaure `users` nem `company` como parte da reposição operacional: servem para comparação. Baixe o backup antes do fim da retenção.
