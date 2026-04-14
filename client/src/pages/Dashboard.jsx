import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createClient,
  deleteClient,
  getClients,
  updateClient
} from '../services/api'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  notes: ''
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/', { replace: true })
      return
    }

    const loadClients = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await getClients()
        setClients(res.data)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/', { replace: true })
          return
        }

        setError(err.response?.data?.message || 'Impossibile caricare i clienti.')
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [navigate])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (editingId) {
        const res = await updateClient(editingId, formData)
        setClients((current) =>
          current.map((client) => (client._id === editingId ? res.data : client))
        )
        setSuccess('Cliente aggiornato con successo.')
      } else {
        const res = await createClient(formData)
        setClients((current) => [res.data, ...current])
        setSuccess('Cliente creato con successo.')
      }

      resetForm()
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/', { replace: true })
        return
      }

      setError(err.response?.data?.message || 'Operazione non riuscita.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (client) => {
    setEditingId(client._id)
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || ''
    })
    setError('')
    setSuccess(`Stai modificando ${client.name}.`)
  }

  const handleDelete = async (client) => {
    const shouldDelete = window.confirm(`Vuoi eliminare ${client.name}?`)
    if (!shouldDelete) {
      return
    }

    setDeletingId(client._id)
    setError('')
    setSuccess('')

    try {
      await deleteClient(client._id)
      setClients((current) => current.filter((item) => item._id !== client._id))

      if (editingId === client._id) {
        resetForm()
      }

      setSuccess('Cliente eliminato con successo.')
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/', { replace: true })
        return
      }

      setError(err.response?.data?.message || 'Eliminazione non riuscita.')
    } finally {
      setDeletingId('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-black text-white">Gestione Clienti</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Il frontend ora usa le rotte del backend per leggere, creare, aggiornare ed eliminare i clienti.
            </p>
          </div>

          <button
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Modifica cliente' : 'Nuovo cliente'}
                </h2>
                
              </div>

              {editingId && (
                <button
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
                  onClick={resetForm}
                  type="button"
                >
                  Annulla modifica
                </button>
              )}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  onChange={handleChange}
                  placeholder="Mario Rossi"
                  value={formData.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  onChange={handleChange}
                  placeholder="cliente@email.com"
                  type="email"
                  value={formData.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor="phone">
                  Telefono
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  onChange={handleChange}
                  placeholder="+39 333 1234567"
                  value={formData.phone}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor="company">
                  Azienda
                </label>
                <input
                  id="company"
                  name="company"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  onChange={handleChange}
                  placeholder="Nome azienda"
                  value={formData.company}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor="notes">
                  Note
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="mt-2 min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  onChange={handleChange}
                  placeholder="Appunti utili sul cliente"
                  value={formData.notes}
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <button
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-200"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? 'Salvataggio in corso...'
                  : editingId
                    ? 'Aggiorna cliente'
                    : 'Crea cliente'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Elenco clienti</h2>
               
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                Totale: {clients.length}
              </div>
            </div>

            {isLoading ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-6 text-sm text-slate-400">
                Caricamento clienti...
              </div>
            ) : clients.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-400">
                Nessun cliente presente. Usa il form a sinistra per creare il primo record.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {clients.map((client) => (
                  <article
                    key={client._id}
                    className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{client.name}</h3>
                        <p className="mt-1 text-sm text-cyan-300">
                          {client.company || 'Azienda non indicata'}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                        {client.email || 'Nessuna email'}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-slate-300">
                      <p>Telefono: {client.phone || 'Non disponibile'}</p>
                      <p>Note: {client.notes || 'Nessuna nota'}</p>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        className="flex-1 rounded-2xl border border-cyan-500/40 px-4 py-2 font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => handleEdit(client)}
                        type="button"
                      >
                        Modifica
                      </button>
                      <button
                        className="flex-1 rounded-2xl border border-rose-500/40 px-4 py-2 font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deletingId === client._id}
                        onClick={() => handleDelete(client)}
                        type="button"
                      >
                        {deletingId === client._id ? 'Eliminazione...' : 'Elimina'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
