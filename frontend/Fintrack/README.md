# Fintrack

Projeto gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 21.2.9.

## Servidor de desenvolvimento

Para iniciar um servidor local de desenvolvimento, execute:

```bash
# instalar dependências
npm ci

# iniciar (opções válidas: npm start ou npm run dev)
npm start
# ou
npm run dev
```

Abra o navegador em `http://localhost:4200/`. A aplicação recarrega automaticamente ao modificar arquivos-fonte.

## Gerar código (scaffolding)

Para gerar um novo componente, execute:

```bash
ng generate component nome-do-componente
```

Para ver todas as opções do Angular CLI:

```bash
ng generate --help
```

## Build (produção)

```bash
ng build
```

Os artefatos de build serão gerados em `dist/`. O build de produção realiza otimizações para performance.

## Executar testes unitários

```bash
ng test
```

O projeto usa `Vitest`/Karma/Jasmine conforme configuração local para testes unitários.
## Dicas de desenvolvimento

 - Use `npm start` ou `npm run dev` conforme sua preferência/local setup.
 - Configure a variável da API no frontend se necessário (ex.: `VITE_API_BASE_URL` ou equivalente) apontando para `http://localhost:8080` durante desenvolvimento.
## Dicas de desenvolvimento

- Use `npm start` ou `npm run dev` conforme sua preferência/local setup.
- Configure a variável da API no frontend se necessário (ex.: `VITE_API_BASE_URL` ou equivalente) apontando para `http://localhost:8080` durante desenvolvimento.

## Build e deploy

O deploy está configurado para Vercel (arquivo `vercel.json`). Para produzir o build e hospedar localmente:

```bash
npm run build
```

## Recursos adicionais

Documentação do Angular CLI: https://angular.dev/tools/cli

