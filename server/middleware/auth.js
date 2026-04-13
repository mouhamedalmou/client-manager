const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization')
  const jwtSecret = process.env.JWT_SECRET

  if (!authHeader) {
    return res.status(401).json({ message: 'Accesso negato' })
  }

  if (!jwtSecret) {
    console.error('JWT_SECRET mancante nel middleware auth')
    return res.status(500).json({ message: 'Configurazione server non valida' })
  }

  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || authHeader.trim()

  if (!token) {
    return res.status(401).json({ message: 'Token mancante' })
  }

  try {
    const verified = jwt.verify(token, jwtSecret)
    req.user = verified
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token scaduto' })
    }

    res.status(401).json({ message: 'Token non valido' })
  }
}
