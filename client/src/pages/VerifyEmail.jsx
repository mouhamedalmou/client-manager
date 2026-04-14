import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function VerifyEmail() {
  const [message, setMessage] = useState('La verifica email non e piu necessaria. Puoi effettuare il login direttamente.')

  useEffect(() => {
    setMessage('La verifica email non e piu necessaria. Puoi effettuare il login direttamente.')
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-slate-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Accesso rapido
          </p>
          <h1 className="mt-4 text-3xl font-black text-white">Account attivo subito</h1>
          <p className="mt-3 text-sm text-slate-400">
            Abbiamo semplificato il flusso: non serve piu verificare l&apos;email prima del login.
          </p>

          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
            {message}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              to="/"
            >
              Vai al login
            </Link>
            <Link
              className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
              to="/register"
            >
              Torna alla registrazione
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
