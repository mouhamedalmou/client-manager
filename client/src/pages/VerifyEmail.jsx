import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage, verifyEmailToken } from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Verifica in corso...')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Token di verifica mancante o link non valido.')
      return
    }

    const runVerification = async () => {
      try {
        const res = await verifyEmailToken({ token })
        setStatus('success')
        setMessage(res.data.message)
      } catch (err) {
        setStatus('error')
        setMessage(getApiErrorMessage(err, 'Verifica email non riuscita.'))
      }
    }

    runVerification()
  }, [searchParams])

  const toneClasses =
    status === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : status === 'error'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-slate-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Verifica account
          </p>
          <h1 className="mt-4 text-3xl font-black text-white">Conferma email</h1>
          <p className="mt-3 text-sm text-slate-400">
            Stiamo verificando il link inviato al tuo indirizzo email.
          </p>

          <div className={`mt-8 rounded-2xl border px-4 py-4 text-sm ${toneClasses}`}>
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
