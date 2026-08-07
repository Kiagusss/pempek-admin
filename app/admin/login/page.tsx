'use client';

import { login } from './actions';
import { useActionState } from 'react';

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-accent)] text-xl font-bold text-white mx-auto">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            Pempek CMS
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-3)]">
            Masuk untuk mengelola toko Anda
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6 shadow-sm">
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--color-ink-2)]">
                Password Admin
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                placeholder="Masukkan password"
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
              />
            </div>

            {state?.error && (
              <p role="alert" className="rounded-[var(--radius-md)] bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)]">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ink-3)]">
          Hanya untuk pemilik toko. Hubungi admin jika lupa password.
        </p>
      </div>
    </main>
  );
}
