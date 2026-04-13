import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, loginUser, resendVerificationEmail } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [canResendVerification, setCanResendVerification] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setCanResendVerification(false)
    setIsSubmitting(true)

    try {
      const res = await loginUser({ email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setCanResendVerification(Boolean(email))
      }

      setError(getApiErrorMessage(err, 'Login fallito. Controlla le credenziali.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)

    try {
      const res = await resendVerificationEmail({ email })
      setSuccess(res.data.message)
      setCanResendVerification(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Reinvio email non riuscito.'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/40">
        <div className="hidden w-1/2 flex-col justify-between bg-linear-to-br from-cyan-500 via-sky-500 to-blue-700 p-10 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-50/80">
              Client Manager
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white">
              Gestisci clienti, note e contatti in un solo posto.
            </h1>
            <p className="mt-4 max-w-sm text-base text-blue-50/85">
              Accedi per entrare nella dashboard e usare tutte le operazioni del backend gia disponibili.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-blue-50/90">API collegate</p>
            <p className="mt-2 text-lg font-semibold text-white">Login JWT + CRUD clienti</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
          <form
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/70 p-8"
            onSubmit={handleLogin}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Accesso
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">Login</h2>
            <p className="mt-2 text-sm text-slate-400">
              Inserisci le credenziali per visualizzare e gestire i clienti.
            </p>

            <label className="mt-8 block text-sm font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="nome@email.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label className="mt-5 block text-sm font-medium text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
              type="password"
              placeholder="Inserisci la password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {canResendVerification && (
              <button
                className="mt-4 w-full rounded-2xl border border-cyan-500/40 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isResending}
                onClick={handleResendVerification}
                type="button"
              >
                {isResending ? 'Invio email in corso...' : 'Invia di nuovo email di verifica'}
              </button>
            )}

            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <button
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-200"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Accesso in corso...' : 'Entra nella dashboard'}
            </button>

            <p className="mt-5 text-center text-sm text-slate-400">
              Non hai ancora un account?{' '}
              <Link
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                to="/register"
              >
                Registrati
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
