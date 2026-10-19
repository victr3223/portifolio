# Abertura em toda visita — 19/10/2026

Removido o controle por `sessionStorage`/`victor-intro` que impedia repetir a abertura. A marca antiga é ignorada, sem apagar ou alterar tema, comentários ou outras chaves. Cada carregamento inicia uma única abertura; `pageshow` reinicia somente quando o navegador restaura o documento pelo cache de navegação (`persisted: true`). Abas internas, tema e navegação por âncoras não estão ligados ao início da abertura.

O visual normal, os três ícones, a logo e os tempos CSS existentes foram preservados: saída com 800 ms após 2,1 s, com encerramento de segurança aos 3 s. Apenas o término da animação do próprio painel encerra a abertura; eventos dos filhos são ignorados. O encerramento cancela o timer e aplica `hidden`, que já possui `display: none !important`. A abertura não altera o bloqueio de rolagem dos diálogos nem o armazenamento. A restauração pelo cache reinicia somente a sobreposição, sem acumular timers.

No modo reduzido, substituída a antiga ocultação completa por saída de opacidade de 150 ms após 200 ms, sem animações dos ícones/texto/logo. O timer de segurança encerra o painel aos 450 ms. Mudar para movimento reduzido durante a abertura também usa o encerramento comum e cancela o timer.

**Regressão:** `tests/intro.test.mjs` executa o bloco real do controlador em uma VM Node com DOM, eventos, relógio e armazenamento simulados. Antes da correção, três dos quatro testes falharam; depois, os 20 testes da suíte passaram. Foram cobertos: primeira entrada; recarregamento com a marca antiga e dados preservados; novo documento/aba com sessão herdada; reabertura com dados locais; ausência de reinício em interações comuns; restauração pelo cache; fim da animação, fallback e cancelamento de timers; conteúdo presente e sem movimento no modo reduzido, conforme regras CSS. O modelo confirma o controle e a preservação de dados, sem afirmar renderização de abas reais.

**Limite visual:** esta alteração não foi observada em um navegador real. O acesso anterior à prévia pelo navegador integrado foi recusado por política de segurança; não foi contornado usando Playwright ou outra superfície. A aparência, a temporização CSS, cliques, rolagem e sessões reais não receberam nova conferência visual nesta etapa. As gravações históricas abaixo são anteriores a esta correção. Os registros desta etapa ficam localmente em `docs/validation-intro-20261019/`, fora do Git.

**GitHub:** na retomada, o repositório estava público e com Pages ativo, diferente do registro inicial de 18/10. Victor confirmou em 19/10 manter o repositório público para preservar o site existente. Essa confirmação substitui a preferência anterior de visibilidade privada nesta atualização.

---

# Cores da Stack Tecnológica — 18/10/2026

Pedido posterior de Victor: restaurar as cores de HTML, CSS, JavaScript, Node.js, Python, Git, Docker e Excel nos dois temas. Removidas as regras de escala de cinza/brilho da classe `.tech-symbol img`, incluindo a sobrescrita do tema claro. Os sete SVG existentes já eram coloridos e foram preservados. O Excel, antes representado pela letra X, usa agora `assets/tech/excel.svg`, obtido do [CDN oficial Microsoft Office](https://res.cdn.office.net/files/fabric-cdn-prod_20240610.001/assets/brand-icons/product/svg/excel_48x1.svg); [licença dos ativos Microsoft Fabric](https://res-1.cdn.office.net/files/fabric/assets/microsoft_fabric_assets_license_agreement_nov_2019.pdf). Esse ativo não é coberto pela licença MIT dos demais SVG.

As imagens continuam em 40 × 40 px com `object-fit: contain`. Cartões, textos, estilos responsivos e controlador de animações não foram alterados. O tratamento de contraste do GitHub foi preservado. A comparação integral com o backup confirma apenas a remoção dos dois filtros no CSS e a troca do símbolo do Excel em `app.js`.

**Verificação desta alteração:** 16/16 testes existentes aprovados, incluindo o teste de SVG/MIME ampliado para Excel; `node --check app.js` aprovado; build concluído com 37 arquivos/4,32 MB e cópias idênticas por SHA-256. [Testes](validation-stack-20261018/tests.txt), [build](validation-stack-20261018/build.txt), [comparação dos arquivos](validation-stack-20261018/source-checks.json).

**Limitação visual:** a ferramenta do navegador integrado recusou a abertura da prévia por política de segurança. Esse bloqueio não foi contornado com outro navegador ou Playwright. A aplicação das cores aos dois temas foi conferida nos arquivos e nas regras CSS; não houve nova inspeção visual da página nesta alteração. As gravações de animações abaixo são anteriores à restauração das cores. A prévia local permanece na porta 4321, com uma instância.

---

# Validação das animações — 18/10/2026

Esta seção descreve o estado atual e substitui as conclusões técnicas de 17/10 abaixo. Retomada autorizada sobre os arquivos existentes, sem reiniciar o projeto. A pasta não contém `.git`; a alteração de `app.js` foi comparada com o backup em `C:\primeiro-cerebro\90_IA\Backups\portifolio-motion-20261018`. HTML, CSS, mídia original, certificados e currículo foram preservados.

## Problema corrigido

Trocas repetidas de abas cancelavam entradas pendentes, mas deixavam seus horários reservados na sequência. Os atrasos acumulavam segundos e a aba podia parecer vazia por tempo excessivo. Agora cada elemento libera sua reserva ao cancelar, concluir ou ser exposto pelo foco; os itens ainda pendentes conservam a ordem. Não foi necessário modificar as direções, distâncias, duração ou design existentes.

Duas regressões novas falharam antes da correção e passaram depois: oito ciclos rápidos de abas e cancelamento parcial de uma sequência. O segundo caso também verifica que o retorno reutiliza o intervalo liberado sem ultrapassar os elementos que continuam aguardando. Evidências: [antes](validation-motion-20261018/unit-before.txt) e [depois, suíte completa](validation-motion-20261018/unit-after.txt).

## Ambiente e método

O navegador integrado não disponibilizou ferramenta de controle nesta sessão. O bloqueio de verificação de URL do Computer Use/Firefox foi respeitado. Seguindo a alternativa explicitamente autorizada por Victor, foram usados **Playwright 1.64.1 e Chromium 156.0.8078.4 headless**, em instalação de QA fora do projeto, sem alterar suas dependências.

Os contextos acessaram o site público em **127.0.0.1:4321**, com preferência de movimento emulada pela API suportada do navegador (`no-preference` e `reduce`), em **1024 × 576** e **390 × 844**. Não houve sobrescrita de `matchMedia`, barra de QA ou uso da porta 4322 nesta etapa. Referências do método: [emulação](https://playwright.dev/docs/emulation) e [gravação de vídeos](https://playwright.dev/docs/videos) do Playwright.

Os cenários gravaram a introdução real e as transições. Para isolar cada trecho, a automação posicionou a rolagem e coletou amostras em 40, 220, 440, 800 e 1300 ms. A rolagem lenta mobile avançou 90 px a cada 140 ms; os ensaios rápidos alternaram posições em 45–65 ms. São rolagens programáticas, não gestos físicos de roda ou toque.

## O que foi observado visualmente

Foram inspecionadas capturas intermediárias e **quadros sequenciais extraídos das gravações**, comparados com o vídeo original e as montagens de `docs/reference/scroll/`. Isso é evidência visual separada das asserções automáticas; não se afirma reprodução contínua assistida em tempo real nem medição de fluidez/FPS.

| Trecho da referência | Observação visual nesta etapa | Evidência |
| --- | --- | --- |
| 14,4–16,4 s | Desktop: texto entra pela esquerda e foto pela direita. Parágrafos e botões aparecem progressivamente. | [Sobre](validation-motion-20261018/filmstrips/about.jpg) |
| 20,5–24,4 s | Estatísticas e destaques sobem com opacidade, com inícios diferentes entre os cartões. | [Destaques](validation-motion-20261018/filmstrips/highlights.jpg) |
| 26–30,6 s | Título, descrição, abas e projetos aparecem em sequência. As linhas inferiores aguardam a chegada à tela. | [Vitrine](validation-motion-20261018/filmstrips/showcase.jpg) e capturas mobile em `run-1/mobile-normal/` |
| 43,2–46,8 s | Título e painéis de contato entram; os painéis vêm de lados opostos no desktop. Nome, e-mail, mensagem e botão surgem gradualmente. | [Contato](validation-motion-20261018/filmstrips/contact.jpg) |
| 47,4–48,2 s | Canais aparecem com subida curta e opacidade, seguidos pelos links internos. | [Campos e canais](validation-motion-20261018/filmstrips/fields-channels.jpg) |
| Mobile | Foto, cartões, campos e canais entram progressivamente durante a rolagem. O último painel e o fim da página ficam legíveis. | [Sobre mobile](validation-motion-20261018/filmstrips/mobile-about.jpg), [contato mobile](validation-motion-20261018/filmstrips/mobile-contact.jpg) |
| Movimento reduzido | Capturas desktop/mobile mostram conteúdos, abas e campos finais expostos, incluindo o mural vazio. | [Stack desktop](validation-motion-20261018/run-1/1024-reduced/technologies.png), [fim mobile](validation-motion-20261018/run-1/390-reduced/bottom.png) |

Gravações completas do movimento normal: [desktop MP4](validation-motion-20261018/desktop-normal.mp4) e [mobile MP4](validation-motion-20261018/mobile-normal.mp4). Os WebM originais dos quatro contextos e capturas permanecem em [run-1](validation-motion-20261018/run-1/). Os quadros comparativos são amostras a cada 200 ms, não todos os frames das gravações.

As direções e a ordem observadas se aproximam da referência. Permanecem diferenças deliberadas: paleta preto/cinza/branco, conteúdo e quantidade de cartões próprios, gatilhos por posição do visitante e composição responsiva. Até 600 px, entradas laterais viram subida de 28 px; o vídeo de referência mostra desktop. Valores preservados: 760 ms, intervalo de 110 ms, laterais de 64 px, subida de 36 px ou curta de 24 px. Não se afirma identidade quadro a quadro ou ritmo idêntico ao gesto de rolagem do autor.

## O que foi validado por automação e código

- **16/16 testes Node**: nove testes existentes do site e sete do controlador de entradas. Incluem PDFs idênticos aos originais, MIME/HEAD do currículo, recursos locais, rotas privadas/travessia/streams NTFS bloqueados, recusa de escrita e contraste dos temas.
- **24/24 verificações no Chromium**, em quatro contextos: elementos fora da tela aguardam; cartões/campos progridem; rolagem rápida nos dois sentidos; saída antes do atraso e retorno; dez ciclos de abas a cada 30 ms; fim da página; menu mobile/foco/Esc; temas e certificado ampliado, próximo e fechamento por teclado. [Resultados](validation-motion-20261018/run-1/results.json).
- **5/5 verificações complementares**: rolagem rápida em primeira visita nos dois tamanhos; 61 caixas de layout com posições e dimensões iguais antes/durante/depois da entrada; 19 elementos de abas nunca visitadas sem consumir sua entrada; mudança para movimento reduzido com quatro campos pendentes, todos liberados imediatamente. [Resultados complementares](validation-motion-20261018/edge-checks.json).
- Medições de eventos confirmaram a ordem do texto, dos campos e do título/descrição da vitrine no desktop, bem como os sinais opostos do deslocamento de texto/foto. Nos dois contextos reduzidos não houve eventos de transição de opacidade dos elementos `.reveal`; o estilo calculado apresentou opacidade 1 e `translate: none` para conteúdo ativo. [Medições](validation-motion-20261018/motion-measurements.json).
- Nenhum erro de página ou aviso/erro de console capturado. Sem rolagem horizontal nos pontos amostrados. Foco de teclado expõe imediatamente o controle e seus ancestrais. Não ficaram elementos ativos visíveis na tela presos em opacidade zero após as esperas verificadas.
- `node --check` aprovado para `app.js` e os scripts de QA. **Build aprovado: 36 arquivos, 4,32 MB**. Fontes HTML/CSS/JS e suas cópias em `dist/` têm SHA-256 idênticos. O build contém apenas site e assets; ferramentas/evidências de QA retornam 404 no servidor público. [Build](validation-motion-20261018/build.txt) e [integridade/isolamento](validation-motion-20261018/build-integrity.json).

Os eventos em `results.json` pertencem ao documento corrente de cada contexto; no mobile, as recargas dos ensaios de foco/retorno reiniciaram essa lista. A rolagem lenta anterior permanece documentada em `slowScroll`, capturas e vídeo. As medições de ordem por eventos citadas acima são do desktop, que não recarregou durante a coleta.

## Limites e prévia preservada

Nenhuma das entradas solicitadas ficou sem amostra visual no modo normal. A comparação não comprova igualdade pixel a pixel, FPS, comportamento em aparelho físico ou compatibilidade com Firefox/Safari. O movimento foi renderizado no Chromium headless; o celular é emulado. A confirmação visual se limita às capturas e sequências de quadros efetivamente inspecionadas.

Não foram criados comentários de teste nesta etapa. O mural continua identificado como local, e a persistência/exclusão já verificadas em 16/10 não foram reexecutadas. O formulário continua informando que depende do aplicativo de e-mail; não houve tentativa de abrir ou contornar seu bloqueio. Menu, temas, abas e galeria receberam nova verificação funcional, sem publicação ou envio externo.

A instância existente foi reutilizada até deixar de responder durante a conferência complementar. Confirmada a porta livre, uma única instância foi reiniciada em **http://127.0.0.1:4321/**. A conferência complementar passou após o reinício. Porta 4322 permaneceu inativa; os contextos Playwright foram encerrados. Se a prévia parar após fechar a sessão, confira a porta antes de `npm start`.

Arquivos desta etapa: correção em `app.js`, duas regressões em `tests/scroll.test.mjs`, ferramentas locais de validação, evidências e documentação. O fixture existente `.tools/motion-preview.mjs` foi preservado, sem integrar a versão pública. O histórico abaixo registra verificações anteriores e suas limitações; não substitui os resultados atuais.

---

# Histórico da validação das animações — 17/10/2026

Etapa concluída sobre os arquivos existentes, após a interrupção. O projeto não foi reiniciado. A pasta continua sem `.git`; não é possível produzir `git status`/diff. Foram lidos os arquivos, os testes e o relatório anterior, e comparados os arquivos com o backup de continuidade em `90_IA/Backups/portifolio-scroll-20261017`. Nenhum original de mídia ou PDF foi alterado.

## Implementação conferida e ajuste final

- Entradas individuais por `IntersectionObserver`, dependentes da posição na tela. Texto e foto vêm de lados opostos no desktop; cartões, títulos e campos sobem com opacidade.
- Sequências mantêm a ordem entre notificações diferentes do observador. Itens de linhas posteriores e abas inativas aguardam visibilidade. Elementos internos aguardam a entrada do painel; foco de teclado torna o controle e seus ancestrais visíveis imediatamente.
- Nesta retomada foi corrigido um caso concreto: sair da área visível antes do término do atraso consumia a entrada. O observador agora permanece ativo durante o atraso; a saída cancela a entrada ainda não iniciada e permite tentá-la ao retornar. Entradas já iniciadas permanecem concluídas. A mesma regra preserva a troca rápida de abas.
- Valores finais: duração de 760 ms, intervalo de 110 ms entre itens, deslocamento lateral de 64 px, subida de 36 px e subida curta de 24 px. No celular até 600 px, entradas laterais são adaptadas para subida de 28 px.
- As animações usam opacidade e `translate`, sem alterar o espaço reservado no layout. Introdução, digitação, inclinação da foto, temas, conteúdo e interações existentes foram preservados.

**Correção do registro anterior:** o pedido posterior de Victor no texto anexado da etapa de animações esclareceu que o parágrafo longo de objetivo pertencia somente ao currículo. Sua retirada da apresentação e do modal já fazia parte dos arquivos retomados e foi preservada. O PDF não foi editado. A declaração de presença desse texto na seção histórica de 16/10 deixou de representar o estado atual.

## Conferência visual em movimento normal

O navegador disponível informa `prefers-reduced-motion: reduce` e não oferece emulação de mídia entre suas capacidades. Por isso foi utilizada a prévia isolada existente `.tools/motion-preview.mjs`, em `127.0.0.1:4322`, com o mesmo HTML, controlador e CSS da aplicação. Somente nessa origem o fixture substitui a preferência de movimento e desativa a regra CSS reduzida; a barra de QA identifica o cenário. Não foram alteradas preferências do sistema.

Foram observadas transições intermediárias, além do estado final, em **1024 × 576** e **390 × 844**. A comparação usou o vídeo original e as sequências de quadros em `docs/reference/scroll/`.

| Referência | Observação no site |
| --- | --- |
| 14,4–16,4 s | Título/descrição, texto pela esquerda e foto pela direita; parágrafos e botões entram em sequência. Na rolagem lenta, o trecho inferior permanece aguardando. |
| 20,5–24,4 s | Estatísticas e destaques sobem com opacidade e diferença de início entre cartões. |
| 26–30,6 s | Título, descrição, abas e projetos entram em sequência. No celular, o terceiro projeto permaneceu sem iniciar enquanto sua posição estava abaixo da área visível; as linhas seguintes de tecnologias também aguardaram. |
| 43,2–46,8 s | Título e descrição do contato, painéis esquerdo/direito e campos progressivos. Nome, e-mail, mensagem e botão mantiveram a ordem mesmo entrando na tela em momentos diferentes. |
| 47,4–48,2 s | Bloco de canais com subida curta e opacidade; links internos aparecem gradualmente. |

As direções e a composição das sequências se aproximam do vídeo. Não se afirma identidade quadro a quadro: os tempos do vídeo incluem a rolagem do autor; os textos, quantidades de cartões, dimensões e paleta são os do portfólio de Victor. A referência usa roxo; preto/cinza/branco foram mantidos conforme solicitado. No celular há a adaptação vertical descrita acima. Duração e distância foram ajustadas visualmente, sem medição de FPS ou comparação automatizada de pixels.

## Casos funcionais e movimento reduzido

- Rolagem lenta, rápida nos dois sentidos, saída/retorno e troca Projetos → Certificados → Stack → Projetos: sem conteúdo permanentemente invisível. O cancelamento no intervalo exato anterior ao início também recebeu teste determinístico, que falhou antes da correção e passou depois.
- Abas nunca visitadas mantiveram zero entradas consumidas no modo normal; nas abas visitadas, itens iniciados permanecem visíveis e os posteriores aguardam. Setas/Home e foco de teclado funcionaram.
- No modo reduzido **nativo da prévia pública 4321**, todas as entradas apresentaram opacidade 1 e `translate: none`, sem elementos pendentes. Desktop e celular conferidos, inclusive final da página. Também foi testada a mudança normal → reduzido → normal na prévia isolada: tudo aparece ao reduzir e não volta a desaparecer ao restaurar.
- Menu mobile abre com foco em Início; Esc fecha e devolve foco ao botão. Temas claro/escuro, galeria de cinco certificados, setas e Esc passaram no smoke test. Nenhum comentário de teste foi criado nesta etapa; o mural continuou vazio e identificado como local.
- Nenhuma rolagem horizontal observada; cartões/campos não deslocam o layout e os controles continuam clicáveis. Nenhum aviso/erro de console capturado nas duas origens. Não houve tentativa de abrir aplicativo externo de e-mail.

## Testes, evidências e prévia

`npm test`: **14/14 aprovados**, sendo nove testes existentes e cinco regressões de rolagem em `tests/scroll.test.mjs` (ordem entre callbacks, dependência liberada por foco, abas rápidas, redução inicial e saída durante atraso). `node --check app.js`: aprovado. `npm run build`: **36 arquivos, 4,32 MB**. Os testes existentes revalidaram bloqueio de rotas, métodos HTTP e integridade/MIME dos PDFs.

`dist/` não contém `.tools`, código da barra QA ou sobrescrita de `matchMedia`. HTML/CSS/JS do build são idênticos às fontes por SHA-256. `GET /.tools/motion-preview.mjs` no servidor público retorna **404**. Registro completo: [testes-build.txt](validation-scroll/testes-build.txt). Capturas dos dois tamanhos e modos: [validation-scroll](validation-scroll/); as capturas durante transições são amostras estáticas, não gravações do movimento completo.

Prévia pública preservada em **http://127.0.0.1:4321/**, com uma instância. A aba e o servidor temporário 4322 foram encerrados após os ensaios. O fixture continua disponível apenas como ferramenta local de validação. Se 4321 parar ao encerrar a sessão, confira a porta antes de executar `npm start`.

Nenhuma animação solicitada ficou sem observação no cenário normal isolado. Limites: navegador com redução nativa (normal testado pelo fixture), celular simulado e aproximação visual ao vídeo; sem aparelho físico ou promessa de identidade exata. Não houve publicação ou envio de mensagens. Os limites funcionais do registro anterior continuam válidos.

---

# Histórico da validação — 16/10/2026

Registro preservado como histórico; a seção de 17/10 acima descreve o estado vigente.

Retomada dos arquivos existentes após interrupção de sessão. Não houve reinicialização, descarte de alterações ou alteração dos originais de mídia. A pasta não contém `.git`; `git status`/diff não estão disponíveis. O estado foi verificado por leitura dos arquivos, testes, integridade e navegador.

## Correção desta retomada

Foi reproduzido um acesso indevido a streams NTFS no servidor local: `GET /assets/next-logo.png%3AZone.Identifier` retornava 200 e 650 bytes de metadados de origem. O stream padrão `::$DATA` também era aceito. Não foi reproduzida leitura de arquivos fora da pasta nem encontrada ligação/reparse point em `assets/`.

`scripts/server.mjs` agora recusa dois-pontos no caminho decodificado, além dos bloqueios existentes. `tests/site.test.mjs` recebeu três casos de regressão no teste de rotas já existente. O teste falhou antes da correção (200 em vez de 404) e passou depois. Os streams e arquivos originais permaneceram intactos; o servidor apenas impede seu acesso HTTP.

Não foi necessário modificar novamente `index.html`, `styles.css` ou `app.js` nesta retomada final. O comportamento previamente implementado foi preservado.

## Verificações executadas

| Verificação | Resultado e evidência |
| --- | --- |
| `npm test` | 9/9 aprovados; `qa/tests-final.log` |
| `npm run build` | Sucesso: 36 arquivos, 4,31 MB em `dist/`; `qa/build-final.log` |
| `node --check app.js` | Sucesso |
| Rotas HTTP sem normalização pelo cliente | 13 tentativas retornaram 404: código/documentação privados, `..` codificado, barra invertida, dupla codificação, variantes com espaço/pontos, caminho Windows, NUL e streams NTFS; `qa/routes-final.json` |
| Métodos de escrita | POST, PUT e DELETE recusados com 405 nos testes existentes |
| Cinco certificados | Assinatura `%PDF-`, MIME `application/pdf`, bytes e SHA-256 idênticos aos originais; miniaturas acessíveis |
| Currículo | GET/HEAD e MIME corretos; download pelo link do navegador concluído; SHA-256 idêntico ao original (`BB40A65ED315E7CE2D7F3E264EACB80E3EAEEDCC4E38733C6A1CD88AFB2DB012`) |
| Temas e textos | Claro/escuro, persistência após recarregar e contraste AA das combinações de texto testadas |
| Abas e detalhes | Projetos/Certificados/Stack, ArrowRight/Home/End; detalhes de NEXT e NEXT COIN, fechamento por Esc; ConnectClass já conferido na sessão anterior |
| Certificados no navegador | Todos os cinco ampliam, título/link/imagem corretos; próximo/anterior e Esc; SENAI cabe na tela mobile |
| Mural local | Criação sem foto, persistência após recarregar, exclusão e nova recarga com contador zero; nenhuma entrada de teste restante. Foto opcional e processamento local já verificados na sessão anterior |
| Menu mobile | Abre por Enter, foco em Início, Esc fecha e devolve foco ao botão; clique no link fecha |
| Console | Nenhum aviso/erro capturado na validação final |
| Links | Âncoras e recursos locais resolvem; destinos profissionais conferidos; GitHub respondeu 200. LinkedIn recusou HEAD com 405, portanto disponibilidade final não confirmada por esse método. WhatsApp conferido como link, sem envio |

Revalidação final em 1440 × 900 e 390 × 844, sem rolagem horizontal. Na sessão anterior também foram conferidos 1024 × 576, 768 × 1024 e 360 × 800. As capturas antigas permanecem; os resultados desta retomada estão em `qa/browser-final.json` e `qa/final-*.jpg`.

O objetivo solicitado está completo e legível no início do portfólio e repetido no detalhe Objetivo:

> Meu objetivo é iniciar minha carreira na área de tecnologia, contribuindo para o desenvolvimento de projetos Full Stack que resolvam problemas reais. Busco aplicar e aprimorar meus conhecimentos em front-end e back-end, participar de diferentes etapas do desenvolvimento e crescer profissionalmente.

## Limites preservados

- O formulário informa que depende do aplicativo de e-mail. O código avisa que nenhuma mensagem foi enviada pelo site. A abertura externa foi bloqueada pelo navegador na sessão anterior; não foi repetida nem contornada, e não se afirma envio real.
- O mural é local e indica isso antes e depois de salvar. Não existe serviço de publicação, recebimento ou sincronização de comentários.
- O certificado SENAI tem duas páginas: a galeria usa a primeira como miniatura e o link abre o PDF completo. Os quatro `.aspx` foram tratados como PDFs por cópias corretas, sem renomear ou sobrescrever originais.
- O ensaio mobile usa dimensões de navegador; não equivale a teste em aparelho físico. Não há promessa de compatibilidade com todo navegador.
- Nenhum deploy, commit, push ou mensagem externa foi realizado. O servidor é uma prévia local, não um serviço de produção.

## Retomar sem refazer

A prévia foi deixada ativa em http://127.0.0.1:4321 com uma única instância. Se não responder após fechar o aplicativo/sessão, execute `npm start` nesta pasta. Leia este registro e o README antes de alterar o projeto. As verificações solicitadas de implementação estão concluídas; eventual revisão visual de Victor ou publicação são etapas posteriores, sem autorização presumida.
