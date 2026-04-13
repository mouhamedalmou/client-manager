const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const clientRoutes = require('./routes/client')
const authMiddleware = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
const jwtSecret = process.env.JWT_SECRET

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)

app.get('/', (req, res) => {
  res.send('API funzionante 🚀')
})

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Accesso autorizzato', user: req.user })
})

if (!mongoUri) {
  console.error('Variabile ambiente MongoDB mancante. Imposta MONGO_URI o MONGODB_URI nelle environment variables.')
  process.exit(1)
}

if (!jwtSecret) {
  console.error('Variabile ambiente JWT_SECRET mancante. Imposta JWT_SECRET nelle environment variables.')
  process.exit(1)
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connesso')
    app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`))
  })
  .catch(err => {
    console.error('Connessione a MongoDB fallita:', err.message)
    process.exit(1)
  })