import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://client-manager-btr2.onrender.com/api'
})

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.request) {
    return 'Impossibile raggiungere il server. Controlla VITE_API_URL su Vercel e CORS_ORIGIN su Render.'
  }

  return fallbackMessage
}

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export const loginUser = (credentials) => API.post('/auth/login', credentials)

export const registerUser = (payload) => API.post('/auth/register', payload)

export const verifyEmailToken = (payload) => API.post('/auth/verify-email', payload)

export const resendVerificationEmail = (payload) => API.post('/auth/resend-verification', payload)

export const getClients = () => API.get('/clients')

export const createClient = (payload) => API.post('/clients', payload)

export const updateClient = (id, payload) => API.put(`/clients/${id}`, payload)

export const deleteClient = (id) => API.delete(`/clients/${id}`)

export default API
