---
name: ddd-nestjs
description: Scaffold DDD + Clean Architecture artifacts for the FitSocial NestJS backend. Use when creating entities, value objects, domain events, repository interfaces/implementations, use cases (commands/queries), controllers, or workers. Argument: <artifact-type> <bounded-context> <name> (e.g. entity identity User)
argument-hint: <artifact-type> <bounded-context> <name>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

## Tarefa

Você receberá argumentos no formato: `$ARGUMENTS`

Interprete-os como: `<artifact-type> <bounded-context> <name>`

**artifact-type** pode ser:
- `entity` → Entidade de domínio com identity
- `value-object` → Value Object imutável
- `domain-event` → Evento de domínio
- `repository` → Interface de repositório + implementação Prisma
- `command` → Command + Handler (use case de escrita)
- `query` → Query + Handler (use case de leitura)
- `controller` → Controller HTTP NestJS com rotas, DTOs e middleware
- `worker` → Consumer de fila RabbitMQ
- `error` → Classe de erro de domínio customizada

**bounded-context** deve ser um dos contextos delimitados do projeto:
- `identity` — User, Profile, Auth
- `challenge` — Challenge, Participant, Ranking
- `workout` — Workout, Exercise, Media
- `social` — Feed, Reaction, Comment

---

## Diretrizes que DEVEM ser seguidas

### Regra de dependência (Clean Architecture)
- Domínio não importa nada de infraestrutura, framework ou aplicação
- `infrastructure/` implementa interfaces definidas em `domain/`
- `application/` orquestra domínio e nunca conhece infraestrutura diretamente
- `interfaces/http/` conhece apenas `application/` (use cases)

### Estrutura de caminhos

```
apps/api/src/
├── domain/
│   └── {context}/
│       ├── entities/        → Entidades e Aggregates
│       ├── value-objects/   → Value Objects
│       ├── events/          → Domain Events
│       ├── errors/          → Erros de domínio
│       └── repositories/    → Interfaces de repositório (somente interfaces)
├── application/
│   └── {context}/
│       ├── commands/        → Command + CommandHandler
│       └── queries/         → Query + QueryHandler
├── infrastructure/
│   └── persistence/
│       └── {context}/       → Implementações Prisma dos repositórios
└── interfaces/
    └── http/
        ├── controllers/     → Controllers NestJS
        ├── middlewares/     → Auth, rate limit, autorização
        └── routes/          → Registro de rotas
```

### Nomenclatura obrigatória
- Arquivos: `kebab-case.ts`
- Classes e interfaces: `PascalCase`
- Funções e variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Enums: `PascalCase` (nome) + `UPPER_SNAKE_CASE` (valores)
- Eventos de domínio: sufixo `Event` → `WorkoutLoggedEvent`
- Use cases: sufixo `UseCase` ou `Handler` → `LogWorkoutUseCase`
- Repositórios: interface `IUserRepository`, implementação `PrismaUserRepository`
- Erros: `{Noun}{Reason}Exception` → `WorkoutNotFoundException`

---

## Templates por artifact-type

### `entity`

```typescript
// apps/api/src/domain/{context}/entities/{name}.ts

import { randomUUID } from 'crypto';

export interface {Name}Props {
  id: string;
  // ... campos do domínio (nunca tipos de DB)
  createdAt: Date;
  updatedAt: Date;
}

export class {Name} {
  private readonly props: {Name}Props;

  private constructor(props: {Name}Props) {
    this.props = props;
  }

  static create(input: Omit<{Name}Props, 'id' | 'createdAt' | 'updatedAt'>): {Name} {
    return new {Name}({
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: {Name}Props): {Name} {
    return new {Name}(props);
  }

  // Getters (nunca setters públicos — imutabilidade)
  get id(): string { return this.props.id; }
  get createdAt(): Date { return this.props.createdAt; }

  // Métodos de domínio (comportamento, não apenas dados)
  // ex: doSomething(): void { ... }

  toJSON(): {Name}Props {
    return { ...this.props };
  }
}
```

### `value-object`

```typescript
// apps/api/src/domain/{context}/value-objects/{name}.ts

interface {Name}Props {
  // campos internos
}

export class {Name} {
  private readonly props: {Name}Props;

  private constructor(props: {Name}Props) {
    this.props = props;
  }

  static create(/* raw input */): {Name} {
    // validar aqui — lançar DomainError se inválido
    return new {Name}({ /* ... */ });
  }

  // Getters somente leitura
  // get value(): string { return this.props.value; }

  equals(other: {Name}): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

### `domain-event`

```typescript
// apps/api/src/domain/{context}/events/{name-in-past-tense}.event.ts

export abstract class DomainEvent {
  readonly id: string;
  readonly occurredAt: Date;

  constructor() {
    this.id = randomUUID();
    this.occurredAt = new Date();
  }
}

export class {Name}Event extends DomainEvent {
  constructor(
    public readonly {entityId}: string,
    // ... dados relevantes para subscribers
  ) {
    super();
  }
}
```

### `repository`

Gerar **dois** arquivos:

**Interface (domínio):**
```typescript
// apps/api/src/domain/{context}/repositories/I{Name}Repository.ts

import { {AggregateRoot} } from '../entities/{aggregate-root}';

export interface I{Name}Repository {
  findById(id: string): Promise<{AggregateRoot} | null>;
  save(entity: {AggregateRoot}): Promise<void>;
  delete(id: string): Promise<void>;
  // métodos específicos de query do contexto
}
```

**Implementação Prisma (infraestrutura):**
```typescript
// apps/api/src/infrastructure/persistence/{context}/Prisma{Name}Repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../PrismaService';
import { I{Name}Repository } from '../../../domain/{context}/repositories/I{Name}Repository';
import { {AggregateRoot} } from '../../../domain/{context}/entities/{aggregate-root}';

@Injectable()
export class Prisma{Name}Repository implements I{Name}Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<{AggregateRoot} | null> {
    const record = await this.prisma.{model}.findUnique({ where: { id } });
    if (!record) return null;
    return {AggregateRoot}.reconstitute(/* map record → props */);
  }

  async save(entity: {AggregateRoot}): Promise<void> {
    const data = entity.toJSON();
    await this.prisma.{model}.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.{model}.delete({ where: { id } });
  }
}
```

### `command`

Gerar **dois** arquivos:

**Command:**
```typescript
// apps/api/src/application/{context}/commands/{name}.command.ts

export class {Name}Command {
  constructor(
    // campos de input validados pelo controller antes de chegar aqui
    public readonly userId: string,
    // ...
  ) {}
}
```

**Handler:**
```typescript
// apps/api/src/application/{context}/commands/{name}.handler.ts

import { Injectable } from '@nestjs/common';
import { {Name}Command } from './{name}.command';
import { I{Repository}Repository } from '../../../domain/{context}/repositories/I{Repository}Repository';

@Injectable()
export class {Name}Handler {
  constructor(
    private readonly {repo}Repository: I{Repository}Repository,
    // private readonly eventBus: EventBus,
  ) {}

  async handle(command: {Name}Command): Promise<void> {
    // 1. Buscar aggregate (ou criar novo)
    // 2. Executar regra de negócio no aggregate
    // 3. Persistir via repositório (unitOfWork se múltiplas escritas)
    // 4. Publicar domain events
  }
}
```

### `query`

```typescript
// apps/api/src/application/{context}/queries/{name}.query.ts
export class {Name}Query {
  constructor(public readonly /* parâmetros de busca */: string) {}
}

// apps/api/src/application/{context}/queries/{name}.handler.ts
@Injectable()
export class {Name}QueryHandler {
  constructor(private readonly {repo}: I{Name}Repository) {}

  async handle(query: {Name}Query): Promise</* DTO de resposta */> {
    // Leitura otimizada — pode usar query builder direto sem passar pelo aggregate
  }
}
```

### `controller`

```typescript
// apps/api/src/interfaces/http/controllers/{name}.controller.ts

import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { {Command}Handler } from '../../../application/{context}/commands/{command}.handler';
import { {Command}Command } from '../../../application/{context}/commands/{command}.command';
import { {Name}RequestDto } from './dtos/{name}.request.dto';

@Controller('{route}')
export class {Name}Controller {
  constructor(private readonly handler: {Command}Handler) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: {Name}RequestDto): Promise<void> {
    // Validação via Zod/class-validator já aplicada no DTO
    await this.handler.handle(new {Command}Command(/* ... body fields ... */));
  }
}
```

Criar também o DTO com validação Zod:
```typescript
// apps/api/src/interfaces/http/controllers/dtos/{name}.request.dto.ts
import { z } from 'zod';

export const {Name}RequestSchema = z.object({
  // campos validados
});

export type {Name}RequestDto = z.infer<typeof {Name}RequestSchema>;
```

### `worker`

```typescript
// apps/api/src/interfaces/workers/{name}.worker.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../infrastructure/messaging/RabbitMQService';

@Injectable()
export class {Name}Worker implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitMQService,
    // private readonly useCase: ...
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.consume('{queue.name}', this.process.bind(this));
  }

  private async process(message: /* EventType */): Promise<void> {
    try {
      // processar mensagem
      // IMPORTANTE: operação deve ser idempotente
      // usar message.id como chave de deduplicação no Redis
      await this.rabbitmq.ack(message);
    } catch (err) {
      // nack com requeue → DLQ após 3 tentativas
      await this.rabbitmq.nack(message, { requeue: true });
    }
  }
}
```

### `error`

```typescript
// apps/api/src/domain/{context}/errors/{name}.exception.ts

export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class {Name}Exception extends DomainError {
  constructor(/* identificador relevante */: string) {
    super(`{Mensagem descritiva}: ${/* identificador */}`, '{CONTEXT}_{REASON}');
  }
}
```

---

## O que fazer após gerar os arquivos

1. **Verificar a camada** — confirmar que nenhum import viola a regra de dependência
2. **Registrar no módulo NestJS** — adicionar o novo Provider/Controller no módulo do bounded context correspondente
3. **Se criou um repositório** — registrar o token de injeção:
   ```typescript
   { provide: 'I{Name}Repository', useClass: Prisma{Name}Repository }
   ```
4. **Se criou um command/query handler** — verificar se precisa de uma nova migration Prisma
5. **Se criou um domain event** — criar o handler de evento em `application/{context}/`
6. **Lembrar de adicionar índice SQL** se o repositório fizer queries por campos não indexados

---

## Checklist de segurança (aplicar sempre)

- [ ] Inputs validados no DTO/controller antes de chegar ao domínio
- [ ] Nenhuma query com concatenação de string (usar parâmetros Prisma)
- [ ] Nenhum secret hardcoded
- [ ] Autorização verificada no middleware, não dentro do use case
- [ ] Logs não expõem PII (email, senha, token)

---

## Exemplos de uso da skill

```
/ddd-nestjs entity identity User
/ddd-nestjs value-object identity Email
/ddd-nestjs domain-event workout WorkoutLogged
/ddd-nestjs repository challenge Challenge
/ddd-nestjs command workout LogWorkout
/ddd-nestjs query challenge GetChallengeRanking
/ddd-nestjs controller workout Workout
/ddd-nestjs worker workout RankingUpdate
/ddd-nestjs error workout WorkoutNotFound
```

Gere todos os arquivos necessários para o artifact solicitado, seguindo **rigorosamente** os templates e diretrizes acima. Coloque cada arquivo no caminho correto dentro de `apps/api/src/`. Após gerar, liste os arquivos criados e os próximos passos de integração.
