# CLAUDE.md — FitSocial (GymRats Clone) Project Guidelines

> Este arquivo define as diretrizes técnicas, arquiteturais e de desenvolvimento que o Claude deve seguir **rigorosamente** ao trabalhar neste projeto. Leia este documento completamente antes de escrever qualquer linha de código.

---

## 📌 Visão Geral do Projeto

**Nome provisório:** FitSocial  
**Tipo:** MVP Web (antes de evoluir para aplicativo mobile)  
**Inspiração:** GymRats — app de desafios de academia entre grupos  
**Objetivo do MVP:** Validar funcionalidades e fluxos via browser antes de construir o app nativo

### O que é o GymRats?
GymRats é uma plataforma onde usuários criam ou entram em desafios de academia, registram treinos com fotos/stats, acumulam pontos e competem em rankings dentro de grupos. Este projeto replica esse core e adiciona funcionalidades extras (a definir iterativamente).

---

## 🏛️ Arquitetura: Domain-Driven Design (DDD) + Clean Architecture

### Por que DDD + Clean Architecture?
O projeto tem **domínio rico** (desafios, treinos, usuários, rankings, grupos) com regras de negócio complexas que vão crescer. DDD permite modelar esses conceitos com fidelidade. Clean Architecture garante que o domínio nunca dependa de frameworks ou infraestrutura.

### Camadas (de dentro para fora)

```
┌─────────────────────────────────────────────────────┐
│                   Frameworks & Drivers               │
│         (HTTP, DB drivers, UI, External APIs)        │
├─────────────────────────────────────────────────────┤
│              Interface Adapters                      │
│     (Controllers, Presenters, Gateways, DTOs)        │
├─────────────────────────────────────────────────────┤
│              Application Layer                       │
│    (Use Cases / Application Services, Commands,      │
│     Queries, Event Handlers)                         │
├─────────────────────────────────────────────────────┤
│                  Domain Layer ← NÚCLEO               │
│   (Entities, Value Objects, Aggregates, Domain       │
│    Events, Repository Interfaces, Domain Services)   │
└─────────────────────────────────────────────────────┘
```

**Regra de dependência:** as setas apontam sempre para dentro. O domínio não conhece nada externo.

### Bounded Contexts (Contextos Delimitados)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Identity   │    │  Challenge   │    │   Workout    │
│   Context    │    │   Context    │    │   Context    │
│              │    │              │    │              │
│ User         │    │ Challenge    │    │ Workout      │
│ Profile      │    │ Participant  │    │ Exercise     │
│ Auth         │    │ Ranking      │    │ Media        │
└──────────────┘    └──────────────┘    └──────────────┘
        │                  │                   │
        └──────────────────┴───────────────────┘
                           │
                    ┌──────────────┐
                    │   Social     │
                    │   Context    │
                    │              │
                    │ Feed         │
                    │ Reaction     │
                    │ Comment      │
                    └──────────────┘
```

### Estrutura de Diretórios

```
/
├── apps/
│   ├── api/                        # Backend (Node.js / Fastify ou NestJS)
│   │   ├── src/
│   │   │   ├── domain/             # Camada de Domínio
│   │   │   │   ├── identity/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── value-objects/
│   │   │   │   │   ├── events/
│   │   │   │   │   └── repositories/   # Interfaces apenas
│   │   │   │   ├── challenge/
│   │   │   │   ├── workout/
│   │   │   │   └── social/
│   │   │   ├── application/        # Casos de uso
│   │   │   │   ├── identity/
│   │   │   │   │   ├── commands/
│   │   │   │   │   └── queries/
│   │   │   │   ├── challenge/
│   │   │   │   ├── workout/
│   │   │   │   └── social/
│   │   │   ├── infrastructure/     # Implementações concretas
│   │   │   │   ├── persistence/    # Repos concretos (Postgres, Redis)
│   │   │   │   ├── messaging/      # RabbitMQ / SQS producers & consumers
│   │   │   │   ├── storage/        # S3 / CDN integration
│   │   │   │   ├── cache/          # Redis adapter
│   │   │   │   └── http/           # Axios clients para serviços externos
│   │   │   └── interfaces/         # Adapters de entrada
│   │   │       ├── http/
│   │   │       │   ├── controllers/
│   │   │       │   ├── middlewares/
│   │   │       │   └── routes/
│   │   │       └── workers/        # Consumers de fila
│   └── web/                        # Frontend (Next.js)
│       ├── src/
│       │   ├── app/                # App Router (Next.js 14+)
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── types/
├── packages/
│   ├── shared-types/               # DTOs e contratos compartilhados
│   └── ui/                         # Design system compartilhado
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── terraform/                  # IaC (quando for para cloud)
└── docs/
    └── adr/                        # Architecture Decision Records
```

---

## 🔐 Authentication vs Authorization

### Conceito — Nunca confundir
- **Authentication (AuthN):** *Quem é você?* — Verificação de identidade
- **Authorization (AuthZ):** *O que você pode fazer?* — Controle de acesso

### Implementação

**Authentication:**
- JWT com dois tokens: `access_token` (15min) + `refresh_token` (7 dias, rotativo)
- `access_token` carregado em memória no cliente (nunca em `localStorage`)
- `refresh_token` em cookie `HttpOnly; Secure; SameSite=Strict`
- Fluxo de refresh silencioso via interceptor no cliente
- Hash de senhas com **bcrypt** (fator de custo mínimo: 12)
- Suporte a OAuth2 (Google) para login social

**Authorization:**
- RBAC (Role-Based Access Control) para permissões gerais: `ADMIN`, `USER`
- ABAC (Attribute-Based) para permissões contextuais: dono do treino, admin do desafio, etc.
- Middleware de autorização separado do middleware de autenticação — nunca misturar
- Verificação de autorização **sempre no servidor**, nunca confiar no cliente

```typescript
// Exemplo de separação no domain
// domain/identity/value-objects/Permission.ts
export enum Permission {
  WORKOUT_CREATE = 'workout:create',
  WORKOUT_DELETE_OWN = 'workout:delete:own',
  WORKOUT_DELETE_ANY = 'workout:delete:any',
  CHALLENGE_MANAGE = 'challenge:manage',
}

// interfaces/http/middlewares/authorize.middleware.ts
export const authorize = (...permissions: Permission[]) => {
  return (req, res, next) => {
    const hasPermission = permissions.every(p => req.user.can(p, req.resource));
    if (!hasPermission) throw new ForbiddenException();
    next();
  };
};
```

---

## 🚦 Rate Limiting

### Estratégia por camada

**Camada 1 — Nginx/Traefik (borda):**
- Limite global por IP antes de chegar na aplicação
- Proteção contra DDoS básico

**Camada 2 — Aplicação (Redis sliding window):**
- Por rota e por usuário autenticado
- Limites diferenciados por tipo de endpoint

```
Endpoints de Auth:         10 req/min por IP
Endpoints públicos:        60 req/min por IP
Endpoints autenticados:   120 req/min por user_id
Upload de mídia:            5 req/min por user_id
```

**Implementação com Redis (sliding window log):**
```typescript
// infrastructure/cache/RateLimiter.ts
export class RateLimiter {
  async isAllowed(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    await this.redis
      .multi()
      .zremrangebyscore(key, '-inf', windowStart)   // remove entradas antigas
      .zadd(key, now, `${now}-${Math.random()}`)    // adiciona request atual
      .expire(key, Math.ceil(windowMs / 1000))
      .exec();
    
    const count = await this.redis.zcard(key);
    return count <= limit;
  }
}
```

**Headers de resposta obrigatórios:**
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1710000000
Retry-After: 30  (somente quando bloqueado — 429)
```

---

## 🗄️ Database Indexes

### Banco Principal: PostgreSQL

**Regra:** todo campo usado em `WHERE`, `ORDER BY`, `JOIN ON` ou `GROUP BY` frequente **precisa** de análise de índice.

**Índices planejados por domínio:**

```sql
-- Identity
CREATE INDEX idx_users_email ON users(email);              -- login
CREATE INDEX idx_users_username ON users(username);        -- busca de perfil

-- Challenges
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_start_date ON challenges(start_date);
CREATE INDEX idx_participants_challenge_id ON participants(challenge_id);
CREATE INDEX idx_participants_user_challenge ON participants(user_id, challenge_id); -- UNIQUE

-- Workouts
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_challenge_id ON workouts(challenge_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);  -- feed cronológico
CREATE INDEX idx_workouts_user_challenge ON workouts(user_id, challenge_id, created_at DESC);

-- Social
CREATE INDEX idx_reactions_workout_id ON reactions(workout_id);
CREATE INDEX idx_comments_workout_id ON comments(workout_id);
CREATE INDEX idx_feed_user_id_created ON feed_items(user_id, created_at DESC);
```

**Diretrizes:**
- Usar `EXPLAIN ANALYZE` antes de criar qualquer índice em produção
- Evitar over-indexing — índices têm custo em writes
- Índices compostos: a ordem das colunas importa (mais seletiva primeiro)
- Usar índices parciais para queries com filtros fixos: `WHERE status = 'active'`
- Monitorar índices não utilizados: `pg_stat_user_indexes`

---

## 🔒 Transactions & ACID Properties

### Quando usar transações (obrigatório)

Qualquer operação que envolva **múltiplas escritas** que precisam ser atômicas:

```typescript
// Exemplo: Entrar em um desafio
// application/challenge/commands/JoinChallengeHandler.ts
async handle(command: JoinChallengeCommand): Promise<void> {
  await this.unitOfWork.transaction(async (tx) => {
    const challenge = await tx.challenges.findById(command.challengeId);
    
    challenge.addParticipant(command.userId);   // regra de domínio
    
    await tx.challenges.save(challenge);         // salva aggregate
    await tx.participants.create({...});         // cria participante
    await tx.notifications.schedule({...});      // agenda notificação
    // Se qualquer linha acima falhar → ROLLBACK automático
  });
}
```

**Propriedades ACID garantidas:**
- **Atomicity:** `unitOfWork.transaction()` envolve tudo em uma única transação DB
- **Consistency:** validações no domínio antes de persistir garantem estado válido
- **Isolation:** usar `REPEATABLE READ` para operações críticas de ranking
- **Durability:** PostgreSQL com WAL (Write-Ahead Logging) habilitado por padrão

**Níveis de isolamento por caso de uso:**
```
READ COMMITTED      → operações de leitura padrão (default Postgres)
REPEATABLE READ     → cálculo de rankings e contagem de pontos
SERIALIZABLE        → distribuição de prêmios / operações críticas únicas
```

**Evitar:**
- Transações longas (mantêm locks → degradam performance)
- Chamar serviços externos (HTTP, email) dentro de transações
- Nested transactions desnecessárias

---

## ⚡ Caching

### Estratégia em camadas

**Cache L1 — In-Memory (processo Node):**
- Dados de configuração e feature flags
- TTL curto (30s–2min)
- `node-cache` ou Map simples

**Cache L2 — Redis:**
- Dados compartilhados entre instâncias da API
- Sessões, tokens de refresh, rate limiting

### O que cachear e por quanto tempo

```
Perfil de usuário público:     TTL 5min    (chave: user:profile:{userId})
Detalhes de um desafio:        TTL 10min   (chave: challenge:{challengeId})
Ranking de um desafio:         TTL 2min    (chave: ranking:{challengeId})   ← hot data
Feed de treinos (página 1):    TTL 1min    (chave: feed:{userId}:p1)
Contagem de reactions:         TTL 30s     (chave: workout:reactions:{id})
```

### Padrões de cache

**Cache-aside (padrão principal):**
```typescript
async getUserProfile(userId: string): Promise<UserProfile> {
  const cacheKey = `user:profile:${userId}`;
  
  const cached = await this.cache.get<UserProfile>(cacheKey);
  if (cached) return cached;
  
  const profile = await this.userRepo.findById(userId);
  await this.cache.set(cacheKey, profile, { ttl: 300 });
  
  return profile;
}
```

**Invalidação:** sempre invalidar no evento de domínio, não no use case

```typescript
// Quando o perfil é atualizado → domain event → cache invalidation handler
class ProfileUpdatedHandler {
  async handle(event: ProfileUpdatedEvent) {
    await this.cache.delete(`user:profile:${event.userId}`);
  }
}
```

**Evitar cache poisoning:** nunca cachear dados derivados de input do usuário sem sanitização.

---

## 📨 Message Queue

### Tecnologia: RabbitMQ (local/dev) → AWS SQS (produção)

### Por que filas neste projeto?

Operações que **não precisam ser síncronas** e que, se falharem, devem ser retentadas:
- Envio de notificações push / email
- Processamento de imagens de treino (resize, compressão, upload para CDN)
- Atualização de rankings após cada treino registrado
- Geração de feed items para seguidores
- Webhooks para integrações futuras

### Arquitetura de filas

```
Producer (API)                 Exchange              Queues              Consumers (Workers)
─────────────                  ────────              ──────              ───────────────────
workout.created ──────────────► workout.exchange ──► workout.notifications ──► NotificationWorker
                                                  └──► workout.feed          ──► FeedWorker
                                                  └──► workout.ranking       ──► RankingWorker
                                                  └──► workout.media         ──► MediaProcessingWorker
```

### Implementação

```typescript
// domain/workout/events/WorkoutLoggedEvent.ts
export class WorkoutLoggedEvent extends DomainEvent {
  constructor(
    public readonly workoutId: string,
    public readonly userId: string,
    public readonly challengeId: string,
    public readonly mediaUrls: string[],
  ) { super(); }
}

// infrastructure/messaging/producers/WorkoutEventProducer.ts
export class WorkoutEventProducer {
  async publishWorkoutLogged(event: WorkoutLoggedEvent): Promise<void> {
    await this.channel.publish(
      'workout.exchange',
      'workout.logged',
      Buffer.from(JSON.stringify(event)),
      { persistent: true, messageId: event.id }   // persistent = sobrevive restart
    );
  }
}

// interfaces/workers/RankingUpdateWorker.ts
export class RankingUpdateWorker {
  async process(message: WorkoutLoggedEvent): Promise<void> {
    try {
      await this.rankingService.recalculate(message.challengeId);
      await this.channel.ack(message);            // confirma processamento
    } catch (err) {
      await this.channel.nack(message, false, true); // requeue para retry
    }
  }
}
```

**Dead Letter Queue (DLQ):** toda fila deve ter uma DLQ configurada. Mensagens que falharem 3x vão para DLQ para análise manual.

**Idempotência:** consumers devem ser idempotentes — processar a mesma mensagem duas vezes não pode causar efeitos colaterais duplos. Usar `messageId` como chave de deduplicação no Redis.

---

## ⚖️ Load Balancer

### Configuração

Para o MVP, **Nginx como load balancer** na mesma máquina (upstream para múltiplas instâncias da API via PM2 cluster ou Docker Swarm).

**Algoritmo:** `least_conn` (menos conexões ativas) — ideal para APIs com latência variável.

```nginx
# infra/nginx/upstream.conf
upstream api_cluster {
  least_conn;
  server api_1:3000 weight=1 max_fails=3 fail_timeout=30s;
  server api_2:3000 weight=1 max_fails=3 fail_timeout=30s;
  server api_3:3000 weight=1 max_fails=3 fail_timeout=30s;
  keepalive 32;
}
```

**Health checks:**
- Nginx verifica `/health` de cada instância a cada 10s
- Instância é removida do pool após 3 falhas consecutivas
- Reintegrada após responder 2 health checks com sucesso

**Session stickiness:** NÃO usar — a API deve ser stateless (estado em Redis).

---

## 🔄 Reverse Proxy — Nginx

### Responsabilidades do Nginx neste projeto

1. **Terminar TLS** — certificados SSL (Let's Encrypt via Certbot)
2. **Roteamento** — `/api/*` → API cluster | `/*` → Next.js
3. **Rate limiting** na borda (antes da aplicação)
4. **Servir assets estáticos** do Next.js com cache agressivo
5. **Compressão gzip/brotli** de respostas
6. **Security headers** obrigatórios

```nginx
# infra/nginx/nginx.conf
server {
    listen 443 ssl http2;
    server_name fitsocial.com;

    # TLS
    ssl_certificate     /etc/letsencrypt/live/fitsocial.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fitsocial.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' https://cdn.fitsocial.com data:;" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;

    # Rate Limiting na borda
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
    limit_req zone=api_limit burst=50 nodelay;

    # Rota da API
    location /api/ {
        proxy_pass         http://api_cluster;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Next.js
    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Assets estáticos com cache longo
    location /_next/static/ {
        proxy_pass  http://nextjs:3000;
        add_header  Cache-Control "public, max-age=31536000, immutable";
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name fitsocial.com;
    return 301 https://$host$request_uri;
}
```

---

## 🌐 Distributed Storage & CDN

### Arquitetura de mídia

```
Client Upload Request
        │
        ▼
   API (validation)
        │
        ▼
   Presigned URL ◄─── AWS S3 (origin bucket)
        │                    │
        │                    ▼
   Client uploads       Lambda / Worker
   diretamente          (resize, compress,
   para S3              webp conversion)
                              │
                              ▼
                        S3 (processed bucket)
                              │
                              ▼
                     CloudFront / Cloudflare CDN
                     cdn.fitsocial.com
```

### Fluxo de upload de mídia de treino

1. Cliente solicita à API um **presigned URL** (S3) — válido por 5 minutos
2. Cliente faz upload direto para S3 (sem passar pela API — alivia o servidor)
3. S3 dispara evento → SQS → Worker de processamento
4. Worker faz resize (thumbnail 300x300, medium 800x800, original)
5. Worker move para bucket processado e invalida cache do CDN
6. Worker publica evento `MediaProcessedEvent` → API atualiza workout com URLs finais

**Convenção de URLs da CDN:**
```
https://cdn.fitsocial.com/workouts/{workoutId}/thumbnail.webp
https://cdn.fitsocial.com/workouts/{workoutId}/medium.webp
https://cdn.fitsocial.com/workouts/{workoutId}/original.webp
https://cdn.fitsocial.com/avatars/{userId}/avatar.webp
```

**Políticas de cache no CDN:**
```
Imagens de treino (imutáveis após processadas): Cache-Control: max-age=31536000
Avatars de usuário (podem mudar):               Cache-Control: max-age=86400
```

**Segurança:**
- Buckets S3 **nunca públicos** — acesso sempre via CDN com URLs assinadas quando necessário
- CORS configurado para aceitar apenas origens do domínio da aplicação
- Scan de vírus em uploads com ClamAV ou serviço AWS equivalente

---

## 💻 Ambiente de Desenvolvimento Local

> O MVP roda 100% local via Docker Compose. Nenhuma conta de cloud é necessária nesta fase. Um único comando sobe toda a infraestrutura.

### Serviços e portas

| Serviço | Imagem | Porta | Acesso |
|---------|--------|-------|--------|
| Next.js (web) | build local | 3000 | http://localhost:3000 |
| NestJS (api) | build local | 4000 | http://localhost:4000 |
| Worker | build local (entry diferente) | — | interno |
| PostgreSQL | postgres:16-alpine | 5432 | via Adminer ou psql |
| Redis | redis:7-alpine | 6379 | interno |
| RabbitMQ | rabbitmq:3-management-alpine | 5672 / 15672 | http://localhost:15672 (UI) |
| Adminer | adminer | 8080 | http://localhost:8080 (DB UI) |

### docker-compose.yml

```yaml
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    depends_on: [api]

  api:
    build: ./apps/api
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/fitsocial
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672
      JWT_SECRET: dev-secret-local-change-in-prod
      JWT_REFRESH_SECRET: dev-refresh-secret-local-change-in-prod
      NODE_ENV: development
    depends_on: [postgres, redis, rabbitmq]
    volumes:
      - ./apps/api:/app        # hot reload em desenvolvimento
      - /app/node_modules      # isola node_modules do container (evita conflito WSL/Linux)

  worker:
    build: ./apps/api          # mesmo Dockerfile da API
    command: ["node", "dist/workers/main.js"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/fitsocial
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672
      NODE_ENV: development
    depends_on: [postgres, redis, rabbitmq]

  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: fitsocial
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"    # painel de gerenciamento — login: guest/guest

  adminer:
    image: adminer
    ports: ["8080:8080"] # UI para inspecionar tabelas do Postgres no browser

volumes:
  pg_data:
```

### Comandos do dia a dia

```bash
# Subir tudo em background
docker compose up -d

# Acompanhar logs da API em tempo real
docker compose logs -f api

# Rodar migrations após subir pela primeira vez (ou após criar novas)
docker compose exec api npx prisma migrate dev

# Abrir Prisma Studio (visualizar dados como planilha)
docker compose exec api npx prisma studio

# Derrubar tudo (preserva volumes — dados do banco ficam)
docker compose down

# Derrubar tudo E apagar dados (reset completo)
docker compose down -v

# Recriar apenas um serviço após mudança no código
docker compose up -d --build api
```

### Ferramentas de inspeção local

**Adminer** (`http://localhost:8080`) — UI web para o PostgreSQL. Configuração de login:
- Sistema: `PostgreSQL`
- Servidor: `postgres`
- Usuário: `postgres`
- Senha: `postgres`
- Base de dados: `fitsocial`

**RabbitMQ Management** (`http://localhost:15672`) — painel para ver filas, mensagens enfileiradas, consumers ativos e taxa de throughput. Login: `guest` / `guest`. Essencial para debugar o fluxo assíncrono de treinos e notificações.

**Prisma Studio** — rode `docker compose exec api npx prisma studio` para abrir uma interface visual de CRUD nos dados do banco, útil durante desenvolvimento de features.

### Variáveis de ambiente

Para desenvolvimento local, crie um `.env` em `apps/api/` e `apps/web/`. Esses arquivos **nunca entram no git** (adicionar ao `.gitignore`):

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

### Upload de mídia local (substituto do S3)

Em produção, o upload vai para S3. Localmente, usar **MinIO** — S3-compatible, roda em Docker:

```yaml
# adicionar ao docker-compose.yml quando precisar testar upload
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"    # console web
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

Console MinIO em `http://localhost:9001`. Configurar o SDK do S3 na API para apontar para `http://minio:9000` quando `NODE_ENV=development`.

### Notas específicas para WSL

- Sempre trabalhar dentro do filesystem do Linux (`~/projects/...`), nunca em `/mnt/c/...` — a performance de I/O no filesystem do Windows via WSL é muito inferior
- Hot reload do Next.js e NestJS funciona melhor com `CHOKIDAR_USEPOLLING=true` se o watcher não detectar mudanças automaticamente
- Para acessar os serviços do Docker no browser do Windows, usar `localhost` normalmente — o WSL2 faz o port forwarding automaticamente

---

## 🛠️ Stack Técnica

### Backend
| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS (DI container nativo facilita DDD) |
| ORM | Prisma (migrations) + Query Builder para queries complexas |
| Banco principal | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Queue | RabbitMQ (dev) / AWS SQS (prod) |
| Storage | AWS S3 + CloudFront |
| Proxy reverso | Nginx |
| Autenticação | JWT + bcrypt |
| Validação | Zod |
| Testes | Vitest + Supertest |

### Frontend
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14+ (App Router) |
| Estilização | Tailwind CSS + shadcn/ui |
| Estado global | Zustand |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Animações | Framer Motion |

### Infraestrutura / DevOps
| Item | Tecnologia |
|------|-----------|
| Containers | Docker + Docker Compose |
| Orquestração MVP | Docker Compose (local) → Swarm/ECS (produção futura) |
| Storage local | MinIO (substituto S3-compatible do S3) |
| DB UI local | Adminer (:8080) |
| Queue UI local | RabbitMQ Management (:15672) |
| CI/CD | GitHub Actions (futuro) |
| Monitoramento | Prometheus + Grafana (futuro) |
| Logs | Winston + Loki (futuro) |
| IaC | Terraform (futuro — cloud) |

---

## 📋 Padrões de Código Obrigatórios

### Nomenclatura
- **Arquivos:** `kebab-case.ts` para tudo exceto classes/componentes React
- **Classes e interfaces:** `PascalCase`
- **Funções e variáveis:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Enums:** `PascalCase` (nome) + `UPPER_SNAKE_CASE` (valores)
- **Eventos de domínio:** sufixo `Event` — `WorkoutLoggedEvent`
- **Use cases:** sufixo `UseCase` ou `Handler` — `LogWorkoutUseCase`
- **Repositórios:** interface `IUserRepository`, implementação `PrismaUserRepository`

### Princípios inegociáveis
- **Fail fast:** validar inputs no limite da aplicação (controller/DTO), nunca deixar dado inválido chegar ao domínio
- **Imutabilidade no domínio:** entidades e value objects imutáveis por padrão
- **Erros expressivos:** usar classes de erro customizadas — `WorkoutNotFoundException`, `ChallengeFullException`
- **Sem magic numbers:** toda constante com nome e tipo explícito
- **Logs estruturados:** sempre JSON, nunca `console.log`
- **Nunca expor stack traces ao cliente** em produção

### Tratamento de erros

```typescript
// Erros de domínio → HTTP status codes no controller, nunca no domínio
// domain/workout/errors/WorkoutErrors.ts
export class WorkoutNotFoundException extends DomainError {
  constructor(workoutId: string) {
    super(`Workout ${workoutId} not found`, 'WORKOUT_NOT_FOUND');
  }
}

// interfaces/http/filters/DomainExceptionFilter.ts
// Mapeia DomainError → resposta HTTP padronizada
{
  "error": {
    "code": "WORKOUT_NOT_FOUND",
    "message": "Workout abc123 not found",
    "timestamp": "2026-01-01T00:00:00Z",
    "requestId": "req-xyz"
  }
}
```

### Padrão de resposta da API
```typescript
// Sucesso
{ "data": { ... }, "meta": { "requestId": "...", "timestamp": "..." } }

// Paginação
{ "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "hasNext": true } }

// Erro
{ "error": { "code": "...", "message": "...", "details": [...] } }
```

---

## 🧪 Testes

### Estratégia (pirâmide de testes)

```
        /\
       /  \      E2E Tests (poucos, fluxos críticos)
      /────\
     /      \    Integration Tests (repositórios, workers, API routes)
    /────────\
   /          \  Unit Tests (domínio, use cases, value objects) ← MAIORIA
  /────────────\
```

### O que testar por camada
- **Domínio:** 100% de cobertura — regras de negócio, validações, eventos
- **Use cases:** com mocks de repositórios e serviços
- **Repositórios:** com banco de dados real em container Docker (testes de integração)
- **Controllers:** com Supertest (testes de integração)
- **Workers:** com RabbitMQ em container

### Nomenclatura de testes
```typescript
describe('LogWorkoutUseCase', () => {
  it('should log workout and publish WorkoutLoggedEvent when valid data provided')
  it('should throw ChallengeNotActiveException when challenge is not active')
  it('should throw DailyLimitExceededException when user already logged today')
})
```

---

## 🔒 Segurança — Checklist Permanente

- [ ] Sanitizar todos os inputs (nunca confiar no cliente)
- [ ] Parametrizar todas as queries SQL (sem concatenação de strings)
- [ ] Validar tipo e tamanho de arquivos no upload
- [ ] Headers de segurança via Nginx (CSP, HSTS, X-Frame-Options)
- [ ] Dependências atualizadas (`npm audit` em CI)
- [ ] Secrets em variáveis de ambiente — nunca em código ou git
- [ ] Logs nunca expõem PII (emails, senhas, tokens)
- [ ] Rate limiting em todos os endpoints de autenticação
- [ ] CORS restrito às origens conhecidas
- [ ] Cookies com `HttpOnly`, `Secure`, `SameSite=Strict`

---

## 🚀 Ordem de Implementação Sugerida

### Fase 1 — Fundação local ✅ CONCLUÍDA
1. ✅ Setup Docker Compose (Postgres, Redis, RabbitMQ, Adminer, MinIO)
2. ✅ Estrutura de diretórios do monorepo e configuração do NestJS com DDD
3. ✅ Domínio `identity` completo (User entity, value objects, events)
4. ✅ AuthN/AuthZ (registro, login, refresh token, logout) — scaffolado
5. ✅ Middleware de rate limiting com Redis — scaffolado

### Fase 2 — Core do Produto ✅ SCAFFOLADO
6. ✅ Domínio `challenge` (criar, entrar, listar desafios) — domain + application + infra scaffolados
7. ✅ Domínio `workout` (registrar treino, listar) — domain + application + infra scaffolados
8. ✅ Upload de mídia com presigned URLs + worker de processamento — scaffolado
9. ✅ Ranking básico calculado via worker (fila) — scaffolado

> **Nota:** "scaffolado" significa que a estrutura de arquivos, interfaces e handlers existem, mas ainda precisam de testes de integração e validação end-to-end com o banco rodando.

### Fase 3 — Social ✅ SCAFFOLADO
10. ✅ Feed de treinos — scaffolado
11. ✅ Reactions e comentários — scaffolado
12. ⬜ Notificações (email + push via worker)

### Fase 4 — Frontend MVP 🔄 EM ANDAMENTO
13. 🔄 Frontend Next.js
    - ✅ Tela de Login (`/login`)
    - ✅ Tela de Cadastro (`/register`)
    - ✅ Dashboard pós-login (`/dashboard`) — com mock data, visual completo
    - ⬜ Tela de Desafio (detalhes + ranking)
    - ⬜ Tela de Registrar Treino (formulário + upload)
    - ⬜ Perfil do usuário
    - ⬜ Integração real com a API (substituir mocks)
14. ⬜ Nginx com TLS + regras de segurança
15. ⬜ Monitoramento e observabilidade
16. ⬜ Testes E2E dos fluxos críticos

---

## 🎨 Convenções de Frontend (Next.js)

- **Nunca usar `<style>` inline no JSX** — todo CSS customizado vai em `apps/web/src/app/globals.css`
- **Fontes via `next/font/google`** no `layout.tsx` (não via `@import url()`) — evita hydration mismatch
- **Variáveis CSS de fonte:** `var(--font-barlow)` (Barlow Condensed) e `var(--font-dm-sans)` (DM Sans)
- **`tsconfig.json` do web não usa `extends` para o base** — as configs ficam inline para funcionar dentro do container Docker onde só `./apps/web` é montado
- **`next.config.mjs`** (não `.ts`) — Next.js 14.2 não suporta `.ts`
- **Rota pós-login:** `/dashboard`
- **Grupos de rota:** `(auth)` para páginas públicas, `(app)` para páginas autenticadas

---

## 📝 Notas Finais para o Claude

- **Antes de criar qualquer arquivo:** pense em qual camada ele pertence
- **Antes de adicionar uma dependência:** avalie se ela não viola a regra de dependência
- **Ao criar queries complexas:** sempre adicionar `EXPLAIN ANALYZE` no comentário para análise futura
- **Ao criar filas:** sempre definir DLQ e política de retry no mesmo momento
- **Ao criar endpoints:** sempre definir o rate limit correspondente
- **Dúvida sobre onde colocar algo?** Prefira errar para o domínio mais interno (mais restritivo)
- **Performance:** meça antes de otimizar. Não adicione cache sem evidência de necessidade
- **Este documento é vivo** — atualize-o quando decisões arquiteturais importantes forem tomadas