# ADR 001 — DDD + Clean Architecture

**Data:** 2026-03-30
**Status:** Aceito

## Contexto

O FitSocial tem domínio rico com regras de negócio complexas: desafios, rankings, treinos, pontuação, notificações e feed social. A complexidade tende a crescer iterativamente.

## Decisão

Adotar **Domain-Driven Design (DDD)** com **Clean Architecture** como base arquitetural.

Bounded Contexts definidos:
- `identity` — autenticação, usuário, perfil
- `challenge` — desafios, participantes, ranking
- `workout` — treinos, exercícios, mídia
- `social` — feed, reactions, comentários

Regra de dependência: camadas internas nunca conhecem camadas externas.

## Consequências

- **Positivo:** domínio isolado e testável independente de framework
- **Positivo:** cada bounded context pode evoluir ou ser extraído independentemente
- **Negativo:** mais arquivos e cerimônia inicial comparado a MVC simples
- **Mitigação:** skill `/ddd-nestjs` no Claude Code acelera o scaffold de artifacts

## Alternativas consideradas

- MVC simples com NestJS: rejeitado — não escala bem com domínio rico
- Microserviços imediatos: rejeitado — overhead prematuro para MVP
