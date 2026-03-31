'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha obrigatória')
    .min(8, 'Mínimo de 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Icons ────────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Decorative background shapes ─────────────────────────────────────────────
function HeroPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Geometric accent — large ring */}
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          border: '1.5px solid rgba(255, 80, 30, 0.15)',
        }}
      />
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          border: '1px solid rgba(255, 80, 30, 0.08)',
        }}
      />

      {/* Accent glow blob */}
      <div
        className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(255,60,20,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Logo wordmark */}
      <div>
        <span
          className="text-white tracking-[0.3em] text-sm font-semibold uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.35em' }}
        >
          FIT<span style={{ color: '#FF3C14' }}>SOCIAL</span>
        </span>
      </div>

      {/* Main headline */}
      <div>
        <h1
          className="text-white leading-[0.88] mb-6"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
            fontWeight: 800,
          }}
        >
          FORGE<br />
          <span style={{ color: '#FF3C14' }}>YOUR</span><br />
          LIMITS
        </h1>
        <p
          className="text-zinc-400 leading-relaxed max-w-xs"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem' }}
        >
          Desafios de academia, rankings em tempo real e uma comunidade que te empurra além do que você acredita ser possível.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-10">
        {[
          { value: '24K+', label: 'Atletas' },
          { value: '3.1M', label: 'Treinos' },
          { value: '180K', label: 'Desafios' },
        ].map(({ value, label }) => (
          <div key={label}>
            <p
              className="text-white font-bold"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '1.75rem',
                lineHeight: 1,
              }}
            >
              {value}
            </p>
            <p
              className="text-zinc-500 text-xs mt-1 uppercase tracking-widest"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // refresh_token via HttpOnly cookie
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error?.message ?? 'Credenciais inválidas');
        return;
      }

      // access_token retornado no body (em memória no cliente — nunca localStorage)
      const { data: { accessToken } } = await res.json();
      // Armazenar em memória via state management (Zustand) — não em localStorage
      // useAuthStore.getState().setAccessToken(accessToken);
      window.location.href = '/dashboard';
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div
        className="min-h-screen grid lg:grid-cols-2"
        style={{ background: '#111111' }}
      >
        {/* ── Left: Hero panel (desktop only) ── */}
        <HeroPanel />

        {/* ── Right: Form panel ── */}
        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16 xl:px-24">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
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
                fontSize: '2.5rem',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              ENTRAR
            </h2>
            <p
              className="mb-10"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255,255,255,0.38)',
                fontSize: '0.875rem',
              }}
            >
              Bem-vindo de volta, atleta.
            </p>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-google"
              aria-label="Entrar com Google"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <span className="divider-line" />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: 'rgba(255,255,255,0.22)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                ou entre com e-mail
              </span>
              <span className="divider-line" />
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="mb-5 px-4 py-3 text-sm"
                style={{
                  background: 'rgba(248, 113, 113, 0.08)',
                  borderLeft: '3px solid #f87171',
                  color: '#fca5a5',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                role="alert"
              >
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div className="mb-7">
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '6px',
                  }}
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={`input-field${errors.email ? ' error' : ''}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#f87171',
                      fontSize: '0.775rem',
                      marginTop: '5px',
                    }}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-[6px]">
                  <label
                    htmlFor="password"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Senha
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.775rem',
                      color: '#FF3C14',
                      textDecoration: 'none',
                      opacity: 0.85,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                  >
                    Esqueci a senha
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`input-field${errors.password ? ' error' : ''}`}
                    style={{ paddingRight: '36px' }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.3)',
                      padding: '4px',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)')}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#f87171',
                      fontSize: '0.775rem',
                      marginTop: '5px',
                    }}
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-8"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" aria-hidden="true" />
                    Entrando…
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Register link */}
            <p
              className="mt-8 text-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Ainda não tem conta?{' '}
              <Link
                href="/register"
                style={{
                  color: '#FF3C14',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}
