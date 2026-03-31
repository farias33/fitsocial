'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ─── Schema ───────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    displayName: z.string().min(1, 'Nome obrigatório').max(80, 'Máximo 80 caracteres'),
    username: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(30, 'Máximo 30 caracteres')
      .regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _'),
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password Strength ────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Fraca', color: '#ef4444' };
  if (score <= 2) return { score: 2, label: 'Razoável', color: '#f97316' };
  if (score <= 3) return { score: 3, label: 'Boa', color: '#eab308' };
  return { score: 4, label: 'Forte', color: '#22c55e' };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.68rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.32)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '6px',
        }}
      >
        {label}
        {hint && (
          <span style={{ color: 'rgba(255,255,255,0.18)', marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          role="alert"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#f87171',
            fontSize: '0.75rem',
            marginTop: '4px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Hero Panel ───────────────────────────────────────────────────────────────
function HeroPanel() {
  const perks = [
    'Entre em desafios com amigos e estranhos',
    'Registre treinos com fotos e stats',
    'Suba nos rankings e acumule pontos',
    'Feed social com a galera do desafio',
  ];

  return (
    <div
      className="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Diagonal accent stripe */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          right: '-5%',
          width: '2px',
          height: '130%',
          background: 'linear-gradient(to bottom, transparent, rgba(255,60,20,0.18), transparent)',
          transform: 'rotate(-15deg)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          right: '8%',
          width: '1px',
          height: '130%',
          background: 'linear-gradient(to bottom, transparent, rgba(255,60,20,0.08), transparent)',
          transform: 'rotate(-15deg)',
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(255,60,20,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div>
        <span
          className="text-white tracking-[0.3em] text-sm font-semibold uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          FIT<span style={{ color: '#FF3C14' }}>SOCIAL</span>
        </span>
      </div>

      {/* Headline */}
      <div>
        <h1
          className="text-white leading-[0.88] mb-6"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(3rem, 5.5vw, 5rem)',
            fontWeight: 800,
          }}
        >
          ENTRE<br />
          PARA A<br />
          <span style={{ color: '#FF3C14' }}>TROPA</span>
        </h1>
        <p
          className="text-zinc-400 max-w-xs mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', lineHeight: 1.6 }}
        >
          Uma conta. Todos os desafios.
        </p>

        {/* Perks list */}
        <ul className="flex flex-col gap-3">
          {perks.map((perk) => (
            <li
              key={perk}
              className="flex items-start gap-3"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.825rem' }}
            >
              <span
                className="flex-shrink-0 flex items-center justify-center rounded-full mt-[1px]"
                style={{
                  width: 18,
                  height: 18,
                  background: 'rgba(255,60,20,0.15)',
                  color: '#FF3C14',
                }}
              >
                <CheckIcon />
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom note */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.15)',
          lineHeight: 1.6,
        }}
      >
        Ao criar sua conta você concorda com os<br />
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>Termos de Uso</span> e{' '}
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>Política de Privacidade</span>.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          displayName: data.displayName,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        const code = body.error?.code;
        if (code === 'IDENTITY_EMAIL_TAKEN') {
          setServerError('Este e-mail já está cadastrado.');
        } else if (code === 'IDENTITY_USERNAME_TAKEN') {
          setServerError('Este username já está em uso.');
        } else {
          setServerError(body.error?.message ?? 'Erro ao criar conta. Tente novamente.');
        }
        return;
      }

      window.location.href = '/login?registered=1';
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#111111' }}>
        <HeroPanel />

        {/* ── Form panel ── */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <span
              className="text-white tracking-[0.3em] text-sm font-semibold uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              FIT<span style={{ color: '#FF3C14' }}>SOCIAL</span>
            </span>
          </div>

          <div className="w-full max-w-sm mx-auto fade-in">
            {/* Heading */}
            <h2
              className="text-white mb-1"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '2.4rem',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              CRIAR CONTA
            </h2>
            <p
              className="mb-9"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255,255,255,0.35)',
                fontSize: '0.875rem',
              }}
            >
              Leva menos de 1 minuto.
            </p>

            {/* Server error */}
            {serverError && (
              <div
                className="mb-6 px-4 py-3 text-sm"
                style={{
                  background: 'rgba(248,113,113,0.08)',
                  borderLeft: '3px solid #f87171',
                  color: '#fca5a5',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                role="alert"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
              {/* Display Name */}
              <Field id="displayName" label="Nome" error={errors.displayName?.message}>
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="Como te chamamos?"
                  className={`input-field${errors.displayName ? ' error' : ''}`}
                  aria-invalid={!!errors.displayName}
                  {...register('displayName')}
                />
              </Field>

              {/* Username */}
              <Field
                id="username"
                label="Username"
                hint="apenas letras, números e _"
                error={errors.username?.message}
              >
                <div className="relative">
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: 'rgba(255,60,20,0.7)',
                      fontSize: '0.9375rem',
                      pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                  >
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="seu_username"
                    className={`input-field${errors.username ? ' error' : ''}`}
                    style={{ paddingLeft: '16px' }}
                    aria-invalid={!!errors.username}
                    {...register('username')}
                  />
                </div>
              </Field>

              {/* Email */}
              <Field id="email" label="E-mail" error={errors.email?.message}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={`input-field${errors.email ? ' error' : ''}`}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
              </Field>

              {/* Password */}
              <Field id="password" label="Senha" error={errors.password?.message}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className={`input-field${errors.password ? ' error' : ''}`}
                    style={{ paddingRight: '32px' }}
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {/* Password strength bar */}
                {passwordValue && (
                  <div>
                    <div className="strength-bar-track">
                      <div
                        style={{
                          height: '100%',
                          width: `${(strength.score / 4) * 100}%`,
                          background: strength.color,
                          borderRadius: '2px',
                          transition: 'width 0.3s ease, background 0.3s ease',
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.7rem',
                        color: strength.color,
                        marginTop: '4px',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      Senha {strength.label}
                    </p>
                  </div>
                )}
              </Field>

              {/* Confirm Password */}
              <Field
                id="confirmPassword"
                label="Confirmar senha"
                error={errors.confirmPassword?.message}
              >
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    className={`input-field${errors.confirmPassword ? ' error' : ''}`}
                    style={{ paddingRight: '32px' }}
                    aria-invalid={!!errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ marginTop: '4px' }}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" aria-hidden="true" />
                    Criando conta…
                  </span>
                ) : (
                  'Criar conta'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                ou
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => { window.location.href = '/api/auth/google'; }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px',
                border: '1.5px solid rgba(255,255,255,0.09)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
              }}
              aria-label="Cadastrar com Google"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {/* Login link */}
            <p
              className="mt-8 text-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.28)',
              }}
            >
              Já tem uma conta?{' '}
              <Link
                href="/login"
                style={{
                  color: '#FF3C14',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
