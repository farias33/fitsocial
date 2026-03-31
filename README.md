# FitSocial

Plataforma de desafios de academia entre grupos — clone do GymRats, construído com DDD + Clean Architecture.

Usuários criam ou entram em desafios, registram treinos com fotos, acumulam pontos e competem em rankings dentro de grupos.

---

## Stack

**Backend:** Node.js 20 · NestJS · PostgreSQL 16 · Redis 7 · RabbitMQ · Prisma  
**Frontend:** Next.js 14 (App Router) · Tailwind CSS · shadcn/ui · TanStack Query · Zustand  
**Infra:** Docker Compose · Nginx · MinIO (S3-compatible local)

---

## Arquitetura

DDD + Clean Architecture com 4 bounded contexts:

```
Identity   →  usuários, autenticação, perfis
Challenge  →  desafios, participantes, ranking
Workout    →  treinos, exercícios, mídia
Social     →  feed, reactions, comentários
```

Regra de dependência: domínio nunca depende de frameworks ou infraestrutura.

---

## Rodando localmente

**Pré-requisitos:** Docker + Docker Compose

```bash
# Clonar o repositório
git clone git@github.com:farias33/fitsocial.git
cd fitsocial

# Criar arquivos de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Subir toda a infraestrutura
docker compose up -d

# Rodar migrations
docker compose exec api npx prisma migrate dev
```

### Serviços disponíveis

| Serviço | URL |
|---------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:4000 |
| Adminer (DB UI) | http://localhost:8080 |
| RabbitMQ UI | http://localhost:15672 |
| MinIO Console | http://localhost:9001 |

**Adminer:** sistema `PostgreSQL` · servidor `postgres` · usuário `postgres` · senha `postgres` · banco `fitsocial`  
**RabbitMQ:** login `guest` / `guest`

---

## Variáveis de ambiente

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fitsocial
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=dev-secret-local-change-in-prod
JWT_REFRESH_SECRET=dev-refresh-secret-local-change-in-prod
NODE_ENV=development

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Estrutura do projeto

```
apps/
  api/         # Backend NestJS
  web/         # Frontend Next.js
packages/
  shared-types/  # DTOs e contratos compartilhados
  ui/            # Design system
infra/
  docker/
  nginx/
docs/
  adr/           # Architecture Decision Records
```

---

## Status do MVP

| Fase | Status |
|------|--------|
| Infraestrutura local (Docker Compose) | Concluída |
| Domínio identity + AuthN/AuthZ | Concluída |
| Domínio challenge + workout | Scaffolado |
| Upload de mídia + worker | Scaffolado |
| Ranking via fila | Scaffolado |
| Feed, reactions, comentários | Scaffolado |
| Frontend — Login / Cadastro / Dashboard | Concluído |
| Frontend — Desafio, Treino, Perfil | Em andamento |
| Integração real frontend ↔ API | Pendente |
