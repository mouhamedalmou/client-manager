import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, registerUser } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Le password non coincidono.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await registerUser({ email, password })
      setSuccess(res.data.message)
      navigate('/', {
        replace: true,
        state: {
          message: res.data.message,
          email
        }
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registrazione fallita. Riprova.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/40">
        <div className="hidden w-1/2 flex-col justify-between bg-linear-to-br from-emerald-500 via-cyan-500 to-sky-700 p-10 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-50/80">
              Client Manager
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white">
              Crea il tuo account e inizia a gestire i clienti.
            </h1>
            <p className="mt-4 max-w-sm text-base text-cyan-50/85">
              La registrazione usa la rotta `POST /api/auth/register` gia esposta dal backend.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-cyan-50/90">Primo accesso</p>
            <p className="mt-2 text-lg font-semibold text-white">
              Crea l&apos;utente e poi accedi alla dashboard.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
          <form
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/70 p-8"
            onSubmit={handleRegister}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Registrazione
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">Crea account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Inserisci email e password per creare un nuovo utente.
            </p>

            <label className="mt-8 block text-sm font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
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
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <label
              className="mt-5 block text-sm font-medium text-slate-200"
              htmlFor="confirmPassword"
            >
              Conferma password
            </label>
            <input
              id="confirmPassword"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
              type="password"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <button
              className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-200"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Registrazione in corso...' : 'Crea account'}
            </button>

            <p className="mt-5 text-center text-sm text-slate-400">
              Hai gia un account?{' '}
              <Link
                className="font-semibold text-emerald-300 transition hover:text-emerald-200"
                to="/"
              >
                Vai al login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
