const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendVerificationEmail } = require('../services/emailService')

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)
const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : ''
const normalizeString = (value) => typeof value === 'string' ? value.trim() : ''
const isValidPassword = (password) => typeof password === 'string' && password.length >= 6
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24

const hashVerificationToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const buildVerificationUrl = (token) => {
  const baseUrl =
    normalizeString(process.env.APP_BASE_URL) ||
    normalizeString(process.env.CORS_ORIGIN).split(',')[0]?.trim() ||
    'http://localhost:5173'

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${normalizedBase}/verify-email?token=${encodeURIComponent(token)}`
}

const setVerificationToken = (user) => {
  const rawToken = crypto.randomBytes(32).toString('hex')

  user.emailVerificationToken = hashVerificationToken(rawToken)
  user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS)

  return rawToken
}

const dispatchVerificationEmail = async (user) => {
  const rawToken = setVerificationToken(user)
  await user.save()

  const verificationUrl = buildVerificationUrl(rawToken)
  return sendVerificationEmail({
    to: user.email,
    verificationUrl
  })
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatori' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email non valida' })
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'La password deve contenere almeno 6 caratteri' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({ message: 'Email gia registrata' })
      }

      const emailResult = await dispatchVerificationEmail(existingUser)

      return res.status(200).json({
        message: emailResult.sent
          ? 'Account gia creato ma non verificato. Ti abbiamo inviato una nuova email di verifica.'
          : 'Account gia creato ma non verificato. SMTP non configurato: controlla i log del server oppure configura l\'invio email.',
        emailSent: emailResult.sent,
        requiresVerification: true
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      email,
      password: hashedPassword
    })

    const emailResult = await dispatchVerificationEmail(user)

    res.status(201).json({
      message: emailResult.sent
        ? 'Registrazione completata. Controlla la tua email per confermare l\'account.'
        : 'Registrazione completata, ma SMTP non e configurato. Controlla i log del server per il link di verifica oppure configura l\'invio email.',
      emailSent: emailResult.sent,
      requiresVerification: true
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email gia registrata' })
    }

    console.error('Errore durante la registrazione:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatori' })
    }

    if (typeof password !== 'string') {
      return res.status(400).json({ message: 'Password non valida' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Credenziali non valide' })

    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: 'Verifica la tua email prima di accedere.',
    //     code: 'EMAIL_NOT_VERIFIED'
    //   })
    // }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET mancante durante il login')
      return res.status(500).json({ message: 'Configurazione server non valida' })
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' })

    res.json({ token })
  } catch (err) {
    console.error('Errore durante il login:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const token = normalizeString(req.body.token)

    if (!token) {
      return res.status(400).json({ message: 'Token di verifica mancante' })
    }

    const hashedToken = hashVerificationToken(token)

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({
        message: 'Link di verifica non valido o scaduto.'
      })
    }

    user.isVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    res.json({ message: 'Email verificata con successo. Ora puoi effettuare il login.' })
  } catch (err) {
    console.error('Errore durante la verifica email:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.resendVerificationEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!email) {
      return res.status(400).json({ message: 'Email obbligatoria' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Questo account e gia verificato.' })
    }

    const emailResult = await dispatchVerificationEmail(user)

    res.json({
      message: emailResult.sent
        ? 'Abbiamo inviato una nuova email di verifica.'
        : 'SMTP non configurato. Controlla i log del server per il link di verifica oppure configura l\'invio email.',
      emailSent: emailResult.sent
    })
  } catch (err) {
    console.error('Errore durante il reinvio email:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}
