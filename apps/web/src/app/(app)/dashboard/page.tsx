'use client';

import { useState } from 'react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USER = { name: 'Thales', avatarInitial: 'T' };

const CHALLENGES = [
  {
    id: 1,
    name: '30 Days of Hell',
    daysTotal: 30,
    daysElapsed: 18,
    participants: 47,
    myRank: 3,
    category: 'Força',
  },
  {
    id: 2,
    name: 'Cardio Outubro',
    daysTotal: 31,
    daysElapsed: 9,
    participants: 112,
    myRank: 11,
    category: 'Cardio',
  },
  {
    id: 3,
    name: 'Mobilidade Diária',
    daysTotal: 21,
    daysElapsed: 21,
    participants: 28,
    myRank: 1,
    category: 'Mobilidade',
  },
];

const FEED = [
  {
    id: 1,
    user: 'Marcos Vinicius',
    initial: 'M',
    workout: 'Peito + Tríceps 🔥',
    time: 'há 23 min',
    reactions: 14,
    comments: 3,
    challenge: '30 Days of Hell',
    detail: 'Supino 100kg 5x5 · Tríceps corda · Fly cabos',
  },
  {
    id: 2,
    user: 'Juliana Ramos',
    initial: 'J',
    workout: 'HIIT 30min',
    time: 'há 1h',
    reactions: 22,
    comments: 7,
    challenge: 'Cardio Outubro',
    detail: '6 rounds · 400kcal · FC max 178bpm',
  },
  {
    id: 3,
    user: 'Rafael Costa',
    initial: 'R',
    workout: 'Costas & Bíceps',
    time: 'há 2h',
    reactions: 9,
    comments: 1,
    challenge: '30 Days of Hell',
    detail: 'Remada 90kg · Pulldown · Rosca direta',
  },
  {
    id: 4,
    user: 'Thales',
    initial: 'T',
    workout: 'Pernas — Volume',
    time: 'ontem',
    reactions: 31,
    comments: 5,
    challenge: '30 Days of Hell',
    detail: 'Agachamento livre 120kg · Leg press · Cadeira extensora',
    isMe: true,
  },
];

const RANKING = [
  { rank: 1, name: 'Juliana Ramos', initial: 'J', points: 2840 },
  { rank: 2, name: 'Rafael Costa', initial: 'R', points: 2710 },
  { rank: 3, name: 'Thales', initial: 'T', points: 2580, isMe: true },
  { rank: 4, name: 'Marcos Vinicius', initial: 'M', points: 2390 },
  { rank: 5, name: 'Ana Beatriz', initial: 'A', points: 2201 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initial,
  size = 36,
  highlight = false,
}: {
  initial: string;
  size?: number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: highlight ? '#FF3C14' : 'rgba(255,255,255,0.08)',
        border: highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-barlow), sans-serif',
        fontWeight: 700,
        fontSize: size * 0.38,
        color: '#fff',
        letterSpacing: '0.05em',
      }}
    >
      {initial}
    </div>
  );
}

function Navbar({ onLog }: { onLog: () => void }) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="max-w-5xl mx-auto px-5 flex items-center justify-between"
        style={{ height: 60 }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontWeight: 800,
            fontSize: '1.1rem',
            letterSpacing: '0.3em',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          FIT<span style={{ color: '#FF3C14' }}>SOCIAL</span>
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={onLog}
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: '#FF3C14',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#e03210';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#FF3C14';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            + Registrar Treino
          </button>
          <Avatar initial={USER.avatarInitial} size={34} highlight />
        </div>
      </div>
    </nav>
  );
}

function ChallengeCard({ c }: { c: (typeof CHALLENGES)[0] }) {
  const progress = Math.round((c.daysElapsed / c.daysTotal) * 100);
  const daysLeft = c.daysTotal - c.daysElapsed;
  const done = daysLeft === 0;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '20px',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,60,20,0.3)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)')
      }
    >
      {/* Category tag */}
      <span
        style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#FF3C14',
          opacity: 0.85,
        }}
      >
        {c.category}
      </span>

      {/* Name */}
      <h3
        className="mt-1 mb-4"
        style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: '#fff',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
        }}
      >
        {c.name}
      </h3>

      {/* Stats row */}
      <div className="flex gap-5 mb-4">
        {[
          { label: done ? 'Concluído' : 'Dias rest.', value: done ? '✓' : String(daysLeft) },
          { label: 'Atletas', value: String(c.participants) },
          { label: 'Seu rank', value: `#${c.myRank}` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p
              style={{
                fontFamily: 'var(--font-barlow), sans-serif',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: label === 'Seu rank' && c.myRank <= 3 ? '#FF3C14' : '#fff',
                lineHeight: 1,
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 2,
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: done ? '#22c55e' : '#FF3C14',
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <p
        className="mt-1"
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.25)',
        }}
      >
        Dia {c.daysElapsed} de {c.daysTotal}
      </p>
    </div>
  );
}

function WorkoutCard({ w }: { w: (typeof FEED)[0] }) {
  const [reacted, setReacted] = useState(false);
  const count = reacted ? w.reactions + 1 : w.reactions;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar initial={w.initial} size={36} highlight={!!w.isMe} />
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: w.isMe ? '#FF3C14' : '#fff',
              }}
            >
              {w.user} {w.isMe && <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>(você)</span>}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {w.challenge} · {w.time}
            </p>
          </div>
        </div>
      </div>

      {/* Workout image placeholder */}
      <div
        style={{
          height: 160,
          background: 'linear-gradient(135deg, rgba(255,60,20,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative diagonal lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 24px)',
          }}
        />
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: 'rgba(255,255,255,0.12)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {w.workout}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.18)',
              marginTop: 4,
            }}
          >
            {w.detail}
          </p>
        </div>
      </div>

      {/* Workout title + actions */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p
          style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#fff',
            letterSpacing: '0.02em',
          }}
        >
          {w.workout}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setReacted((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.8rem',
              color: reacted ? '#FF3C14' : 'rgba(255,255,255,0.45)',
              transition: 'color 0.15s, transform 0.15s',
              transform: reacted ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            🔥 {count}
          </button>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            💬 {w.comments}
          </span>
        </div>
      </div>
    </div>
  );
}

function RankingRow({ r }: { r: (typeof RANKING)[0] }) {
  const medal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{
        background: r.isMe ? 'rgba(255,60,20,0.07)' : 'transparent',
        borderLeft: r.isMe ? '2px solid #FF3C14' : '2px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      {/* Rank */}
      <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
        {medal[r.rank] ? (
          <span style={{ fontSize: '1.1rem' }}>{medal[r.rank]}</span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            #{r.rank}
          </span>
        )}
      </div>

      <Avatar initial={r.initial} size={32} highlight={!!r.isMe} />

      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: '0.875rem',
          fontWeight: r.isMe ? 600 : 400,
          color: r.isMe ? '#fff' : 'rgba(255,255,255,0.7)',
          flex: 1,
        }}
      >
        {r.name}
        {r.isMe && (
          <span
            style={{
              fontSize: '0.65rem',
              color: '#FF3C14',
              marginLeft: 6,
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            você
          </span>
        )}
      </p>

      <p
        style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          color: r.isMe ? '#FF3C14' : '#fff',
          letterSpacing: '0.02em',
        }}
      >
        {r.points.toLocaleString('pt-BR')}
        <span
          style={{
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.3)',
            marginLeft: 3,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          pts
        </span>
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-barlow), sans-serif',
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div style={{ background: '#111111', minHeight: '100vh', color: '#fff' }}>
      <Navbar onLog={() => setLogOpen(true)} />

      <main className="max-w-5xl mx-auto px-5 py-10">
        {/* ── Welcome ── */}
        <section className="mb-12">
          <h1
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 0.95,
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            BOM TREINO,{' '}
            <span style={{ color: '#FF3C14' }}>{USER.name.toUpperCase()}</span>!
          </h1>
          <p
            className="mt-3"
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.38)',
              maxWidth: 380,
            }}
          >
            Você está no top 3 em 2 desafios. Continue assim — o ranking atualiza em tempo real.
          </p>
        </section>

        {/* ── Challenges ── */}
        <section className="mb-12">
          <SectionLabel>Meus Desafios Ativos</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHALLENGES.map((c) => (
              <ChallengeCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* ── Feed + Ranking ── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Feed */}
          <section>
            <SectionLabel>Feed de Treinos</SectionLabel>
            <div className="flex flex-col gap-4">
              {FEED.map((w) => (
                <WorkoutCard key={w.id} w={w} />
              ))}
            </div>
          </section>

          {/* Ranking */}
          <section>
            <SectionLabel>Ranking — 30 Days of Hell</SectionLabel>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              {RANKING.map((r, i) => (
                <div
                  key={r.rank}
                  style={{
                    borderBottom:
                      i < RANKING.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <RankingRow r={r} />
                </div>
              ))}
            </div>

            {/* Points legend */}
            <p
              className="mt-3"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              Atualizado há 2 min · 1 treino = 100 pts base
            </p>
          </section>
        </div>
      </main>

      {/* ── Log Workout Modal (placeholder) ── */}
      {logOpen && (
        <div
          onClick={() => setLogOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 32,
              width: '90%',
              maxWidth: 420,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-barlow), sans-serif',
                fontWeight: 800,
                fontSize: '1.8rem',
                color: '#fff',
                marginBottom: 8,
              }}
            >
              REGISTRAR TREINO
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 24,
              }}
            >
              Em breve — formulário completo com upload de foto e stats.
            </p>
            <button
              onClick={() => setLogOpen(false)}
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
