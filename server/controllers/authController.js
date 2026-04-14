const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)
const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : ''
const isValidPassword = (password) => typeof password === 'string' && password.length >= 6

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
      return res.status(409).json({ message: 'Email gia registrata' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      email,
      password: hashedPassword,
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    })

    await user.save()

    res.status(201).json({
      message: 'Registrazione completata. Ora puoi effettuare il login.'
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
  res.json({ message: 'La verifica email non e piu necessaria. Puoi effettuare il login direttamente.' })
}

exports.resendVerificationEmail = async (req, res) => {
  res.json({ message: 'La verifica email non e piu necessaria. Puoi effettuare il login direttamente.' })
}
