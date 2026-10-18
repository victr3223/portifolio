# Portfólio de Victor

Portfólio de Victor Rogenare, desenvolvido em HTML, CSS e JavaScript, com fontes e imagens locais. Apresenta projetos, certificados, currículo e tecnologias, com temas claro/escuro, navegação por teclado, galeria ampliada e animações de rolagem que respeitam a preferência por movimento reduzido.

Repositório: [victr3223/portifolio](https://github.com/victr3223/portifolio), privado inicialmente. O envio do código ao GitHub não publica um site nem ativa GitHub Pages.

## Executar

Requer Git e Node.js 20 ou superior, com npm. Não há dependências npm de produção ou desenvolvimento: os comandos principais usam apenas módulos nativos do Node.js. `package.json` declara os scripts e a versão mínima do Node; não é necessário executar `npm install`.

Com uma conta autorizada a acessar o repositório privado:

```powershell
git clone https://github.com/victr3223/portifolio.git
cd portifolio
```

Inicie a prévia:

```powershell
npm start
```

Abra http://127.0.0.1:4321. Antes de iniciar outra instância, confira se a prévia já responde nessa porta e reutilize-a. O servidor fica restrito a `127.0.0.1`, serve apenas os arquivos públicos e não recebe formulários nem comentários. `npm run dev` é um alias para o mesmo servidor; `Ctrl+C` encerra a instância iniciada no terminal.

```powershell
npm test
npm run build
```

O build copia o site e `assets/` para `dist/`; não publica nada. Essa pasta é gerada localmente e não entra no Git. Os 16 testes verificam os recursos do site, a integridade dos documentos, o servidor e o controlador das animações.

## Arquivos incluídos

O repositório contém código, `package.json`, scripts, testes, documentação e **todos os arquivos utilizados pelo site** em `assets/`: logos, fotos, GIF e sua imagem alternativa, imagens dos projetos, fontes/licenças, certificados, miniaturas e currículo.

As mídias originais na raiz também são preservadas. Os testes comparam os quatro `.aspx`, o certificado SENAI e `curriculo.pdf` com as cópias públicas; mantenha esses originais ao clonar. `.gitattributes` trata os documentos e as mídias como binários para preservar seus bytes.

O `.gitignore` exclui dependências instaladas, caches, build, ferramentas baixadas, registros temporários, credenciais e arquivos `.env`. O vídeo de referência, capturas e evidências locais de QA não são usados pelo site e ficam fora do repositório. Não há configuração de segredo ou `.env` necessária para executar o portfólio.

## Conteúdo e comportamento

- `index.html`: apresentação, sobre, navegação e formulários.
- `styles.css`: temas, responsividade e animações.
- `app.js`: detalhes, abas, certificados, tema e mural local.
- `assets/asset-manifest.json`: origem, metadados e hashes dos cinco certificados.
- `tests/site.test.mjs`: nove testes, incluindo integridade dos PDFs e bloqueio de caminhos privados/streams NTFS.
- `tests/scroll.test.mjs`: sete regressões do controlador de entradas, sequências, foco, abas, cancelamentos e movimento reduzido.

As entradas respondem à posição na tela e respeitam `prefers-reduced-motion`. Para conferir movimento normal quando o navegador de teste força redução, execute `node .tools/motion-preview.mjs` e acesse a prévia isolada em http://127.0.0.1:4322. Verifique antes se essa porta já está em uso. Essa ferramenta é exclusiva de QA, não integra o build nem a versão pública. Encerre-a após o teste; preserve a prévia principal na porta 4321.

A validação histórica de 18/10 usou Playwright 1.64.1/Chromium, diretamente na porta 4321, sem o fixture. Os quatro scripts próprios `.tools/*.mjs` são versionados; as ferramentas baixadas e suas instalações não são. O Playwright é opcional e externo aos comandos principais: para repetir o ensaio, instale-o em uma pasta de QA separada, instale seu Chromium, defina `PORTFOLIO_PLAYWRIGHT` com o caminho absoluto do `playwright/index.mjs` e execute `node .tools/validate-motion.mjs` com a prévia ativa. Ele grava novas capturas, vídeos e resultados em uma pasta local de `docs/`.

`.tools/validate-motion-edges.mjs` contém a conferência complementar e grava na pasta histórica `docs/validation-motion-20261018/`, que deve existir. `.tools/render-motion-evidence.mjs` foi usado para montar os quadros da validação original: depende desse registro histórico e de FFmpeg em `.tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe`. Esses dados/binários não acompanham o clone; o renderizador não faz parte de `npm test` ou `npm run build`. O site não depende dessas ferramentas.

Os quatro originais `.aspx` são PDFs. As cópias em `assets/certificates/` têm extensão `.pdf` e preservam exatamente seus bytes. A galeria mostra uma miniatura e permite abrir o documento completo. O currículo também é uma cópia idêntica ao original.

Comentários e foto opcional ficam somente no armazenamento deste navegador, para esta origem. Não são depoimentos publicados nem mensagens enviadas ao Victor. O formulário de contato abre o aplicativo de e-mail; o visitante precisa revisar e enviar por esse aplicativo. O site não confirma envio.

Os projetos sem demonstração/repositório público exibem seu estado real nos detalhes. Dados futuros de NEXT/NEXT COIN estão identificados como planos.

## Validação e continuidade

Resultados e limites: [docs/VALIDACAO-FINAL.md](docs/VALIDACAO-FINAL.md). As validações históricas de 18/10 registram 16 testes Node, 29 verificações no Chromium e inspeção visual de quadros sequenciais. A restauração posterior das cores recebeu testes e build, com a nova conferência visual bloqueada pela política do navegador. Capturas e registros citados no relatório permanecem locais em `docs/qa/`, `docs/reference/` e `docs/validation-*/`; esses anexos não estão no GitHub.

O histórico Git começa com o envio do projeto existente. As etapas anteriores foram preservadas nos arquivos e documentadas com backups, pois a pasta ainda não tinha um repositório Git.

Publicação do site e serviços de comentários online são etapas separadas do versionamento privado no GitHub.
