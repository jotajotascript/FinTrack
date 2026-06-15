# FinTrack

Sistema para gestão financeira pessoal.

## Pré-requisitos

- Java 21 + Maven (backend)
- Node 18+ e npm (frontend)
- PostgreSQL (opcional; H2 é usado em testes)
- Docker (opcional)

## Rodar em desenvolvimento (rápido, sem Docker)

### Backend

```bash
cd backend/FinTrackAPI

# exporte variáveis de ambiente (exemplo)
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/fintrack"
export SPRING_DATASOURCE_USERNAME="seu_usuario"
export SPRING_DATASOURCE_PASSWORD="sua_senha"
export JWT_SECRET="sua_chave_jwt"

# rodar em modo dev
./mvnw spring-boot:run

# ou empacotar e executar o jar
./mvnw clean package -DskipTests
java -jar target/FinTrackAPI-0.0.1-SNAPSHOT.jar
```

### Frontend

Este projeto suporta `npm start` e também `npm run dev` (use o que preferir).

```bash
cd frontend/Fintrack
npm ci
# para desenvolvimento rápido
npm start

# ou, se preferir usar o script dev (mais rápido em alguns setups):
npm run dev

# build de produção
npm run build
# acessar: http://localhost:4200
```

## Variáveis de ambiente recomendadas

Backend:
- `SPRING_DATASOURCE_URL` — ex.: `jdbc:postgresql://localhost:5432/fintrack`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

Frontend (opcional):
- `VITE_API_BASE_URL` ou variável equivalente usada pelo app: `http://localhost:8080`

## Rodar com Docker (backend)

```bash
cd backend/FinTrackAPI
docker build -t fintrackapi:latest .
docker run -p 8080:8080 \
	-e SPRING_DATASOURCE_URL="jdbc:postgresql://host.docker.internal:5432/fintrack" \
	-e SPRING_DATASOURCE_USERNAME=seu_usuario \
	-e SPRING_DATASOURCE_PASSWORD=sua_senha \
	-e JWT_SECRET="sua_chave" \
	fintrackapi:latest
```

## Testes

- Backend (JUnit + integração H2):

```bash
cd backend/FinTrackAPI
./mvnw test
```

- Frontend (unit):

```bash
cd frontend/Fintrack
npm ci
npm test
```


## CI / CD

Workflows já presentes:
- `/.github/workflows/backend-CI.yml` — build/test backend
- `/.github/workflows/frontend-CI.yml` — build frontend

Configure os secrets no GitHub para deploys (`VERCEL_TOKEN`, `DOCKER_*`, `JWT_SECRET`, credenciais do DB).

## Endpoints principais (ex.: documentação curta)

- `POST /usuario/register` — registra usuário
- `POST /usuario/login` — realiza login e retorna token JWT
- `GET /usuario/me` — dados do usuário (protegido)
- `POST /despesa` — cria despesa (protegido)
- `GET /despesa` — lista despesas do usuário (protegido)
- `PUT /despesa/{id}` — atualiza despesa (protegido)
- `DELETE /despesa/{id}` — remove despesa (protegido)
- `POST /receita`, `GET /receita`, `PUT /receita/{id}`, `DELETE /receita/{id}` — operações análogas para receitas
- `GET /resumo` — calcula resumo financeiro no período (protegido)

## Observações e boas práticas

- Em desenvolvimento prefira `./mvnw spring-boot:run` para backend e `npm start` (ou `npm run dev`) para frontend — reinício rápido.
- Mantenha READMEs separados para `frontend` e `backend` com detalhes e exemplos de payloads.
- Se quiser, posso gerar `backend/README.md` com exemplos de requests/curl e payloads.