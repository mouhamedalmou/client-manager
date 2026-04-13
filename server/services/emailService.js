const nodemailer = require('nodemailer')

const normalizeBool = (value) => String(value).toLowerCase() === 'true'

const getSmtpConfig = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
  } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE
      ? normalizeBool(process.env.SMTP_SECURE)
      : Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  }
}

exports.sendVerificationEmail = async ({ to, verificationUrl }) => {
  const smtpConfig = getSmtpConfig()
  const fromAddress = process.env.SMTP_FROM

  if (!smtpConfig || !fromAddress) {
    console.warn('SMTP non configurato. Link di verifica disponibile nei log del server.')
    console.log(`Verifica email per ${to}: ${verificationUrl}`)
    return { sent: false, fallback: 'console' }
  }

  const transporter = nodemailer.createTransport(smtpConfig)

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Conferma il tuo account Client Manager',
    text: [
      'Benvenuto in Client Manager.',
      '',
      'Conferma il tuo account aprendo questo link:',
      verificationUrl,
      '',
      'Se non hai richiesto questa registrazione, ignora questa email.'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Conferma il tuo account</h2>
        <p>Benvenuto in Client Manager.</p>
        <p>Clicca sul pulsante qui sotto per verificare il tuo indirizzo email:</p>
        <p>
          <a
            href="${verificationUrl}"
            style="display:inline-block;padding:12px 18px;border-radius:10px;background:#22c55e;color:#020617;text-decoration:none;font-weight:700;"
          >
            Verifica email
          </a>
        </p>
        <p>Se il pulsante non funziona, copia e incolla questo link nel browser:</p>
        <p>${verificationUrl}</p>
        <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
      </div>
    `
  })

  return { sent: true }
}
