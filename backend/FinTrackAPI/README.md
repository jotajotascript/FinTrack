# FinTrack — Backend

Este README descreve como executar o backend localmente e traz exemplos de endpoints e payloads.

## Requisitos

- Java 21 + Maven
- PostgreSQL (opcional; H2 para testes)

## Executar em desenvolvimento

```bash
cd backend/FinTrackAPI

# configurar variáveis de ambiente
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/fintrack"
export SPRING_DATASOURCE_USERNAME="seu_usuario"
export SPRING_DATASOURCE_PASSWORD="sua_senha"
export JWT_SECRET="sua_chave_jwt"

./mvnw spring-boot:run
```

## Build e executar jar

```bash
./mvnw clean package -DskipTests
java -jar target/FinTrackAPI-0.0.1-SNAPSHOT.jar
```

## Endpoints principais e exemplos

1) Registrar usuário

POST /usuario/register

Exemplo (curl):

```bash
curl -X POST http://localhost:8080/usuario/register \
  -H "Content-Type: application/json" \
  -d '{"nome": "João", "email": "joao@email.com", "senha": "senha123"}'
```

Resposta esperada: JSON do usuário criado (status 200 OK).

2) Login

POST /usuario/login

```bash
curl -X POST http://localhost:8080/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","senha":"senha123"}'
```

Resposta esperada: JSON com campo `token` (JWT).

3) Criar despesa (endpoint protegido)

POST /despesa

```bash
curl -X POST http://localhost:8080/despesa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "valorDespesa":150.00,
    "dataVencimento":"2025-06-10",
    "categoria":"OUTROS",
    "tipoSubclasse":"Aluguel",
    "recorrencia":"MENSAL",
    "descricao":"Aluguel apartamento"
  }'
```

4) Listar despesas

GET /despesa

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/despesa
```

5) CRUD de receitas (ex.: POST /receita) — payload semelhante ao da despesa, usando `valorReceita` e `dataRecebimento`.

6) Resumo

GET /resumo?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/resumo?dataInicio=2025-06-01&dataFim=2025-06-30"
```

## Testes

Executar suíte de testes:

```bash
./mvnw test
```

## Notas

- Todos os endpoints que alteram ou leem dados do usuário exigem cabeçalho `Authorization: Bearer <token>` obtido no login.
- Em ambiente de desenvolvimento você pode usar H2 (configurar profile ou properties) para testes rápidos.
