'use client'

import { useActionState } from 'react'
import { Sparkles } from 'lucide-react'
import { login } from '@/app/actions'

const initialState = { error: '' }

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-rose-dark mx-auto mb-3" />
          <h1 className="font-display italic text-3xl text-rose-deep">
            Espace Cristina
          </h1>
          <p className="text-sm text-mauve mt-1">Ma Collection Beauté</p>
        </div>

        <form action={action} className="bg-white rounded-3xl p-8 shadow-sm border border-border space-y-4">
          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
              {state.error}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-2xl border border-border text-sm text-plum placeholder-mauve focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
              placeholder="ton@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 rounded-2xl border border-border text-sm text-plum placeholder-mauve focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-rose-deep text-white rounded-2xl text-sm font-medium hover:bg-plum transition-colors disabled:opacity-60"
          >
            {pending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
