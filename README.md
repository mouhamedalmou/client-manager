# Client Manager

Applicazione full stack per la gestione dei clienti con autenticazione JWT, conferma email e dashboard CRUD.

## Panoramica

Il progetto e composto da:

- `client`: frontend React con Vite, Tailwind CSS e Axios
- `server`: backend Node.js con Express, MongoDB, Mongoose e JWT

Funzionalita principali:

- login utente
- registrazione utente con conferma email
- protezione delle rotte con token JWT
- lista clienti
- creazione cliente
- modifica cliente
- eliminazione cliente

## Stack Tecnologico

Frontend:

- React
- Vite
- React Router
- Axios
- Tailwind CSS

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- Nodemailer

## Struttura Del Progetto

```text
client-manager/
|-- client/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- Login.jsx
|   |   |   `-- Dashboard.jsx
|   |   |-- services/
|   |   |   `-- api.js
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   |-- public/
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- .env.example
|   |-- package.json
|   `-- server.js
`-- README.md
```

## Requisiti

- Node.js installato
- MongoDB Atlas o MongoDB locale

## Configurazione

### 1. Backend

Vai nella cartella `server` e crea il file `.env` partendo da `.env.example`.

Esempio:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/client-manager
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
APP_BASE_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=Client Manager <no-reply@example.com>
PORT=3000
```

Per sviluppo locale puoi usare il file `.env`, ma in produzione non devi salvare segreti nel codice o committarli nel repository.

Su piattaforme come Render e Vercel configura sempre:

- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `APP_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `PORT` se richiesto dalla piattaforma

Queste variabili vanno inserite dalla dashboard della piattaforma in `Settings` / `Environment Variables`.

Installa le dipendenze:

```powershell
cd server
npm install
```

Avvia il server in sviluppo:

```powershell
npm run dev
```

Oppure in modalita normale:

```powershell
npm start
```

### 2. Frontend

Apri la cartella `client`:

```powershell
cd client
npm install
```

Avvia il frontend:

```powershell
npm run dev
```

Per creare la build di produzione:

```powershell
npm run build
```

## URL E Configurazione API

Di default il frontend usa:

```text
http://localhost:3000/api
```

Se vuoi cambiare URL API, puoi impostare una variabile Vite:

```env
VITE_API_URL=http://localhost:3000/api
```

Nel progetto e presente anche `client/.env.example` come riferimento.

## Rotte Backend Disponibili

Autenticazione:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`

Clienti protetti da token:

- `GET /api/clients`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

## Note Per Git

- `client/node_modules` e `server/node_modules` non vanno caricati su Git
- `server/.env` non va caricato su Git
- `MONGO_URI` e `JWT_SECRET` non vanno mai scritti direttamente nel codice
- `CORS_ORIGIN` va configurato come environment variable, non hardcoded
- `SMTP_PASS` e le credenziali SMTP non vanno mai committate nel repository
- i file `package-lock.json` invece possono essere versionati

Nel progetto sono gia presenti i file `.gitignore` dentro `client` e `server` per escludere i file sensibili e le dipendenze installate.

## Deploy

### Backend Su Render

1. Pubblica il repository su GitHub.
2. In Render crea un nuovo `Web Service`.
3. Collega il repository GitHub del progetto.
4. Imposta `Root Directory` su `server`.
5. Usa questi comandi:

```text
Build Command: npm install
Start Command: npm start
```

6. Aggiungi queste environment variables in Render:

```env
MONGO_URI=la-tua-connessione-mongodb
JWT_SECRET=una-chiave-lunga-e-casuale
CORS_ORIGIN=https://il-tuo-frontend.vercel.app
APP_BASE_URL=https://il-tuo-frontend.vercel.app
SMTP_HOST=smtp.tuo-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tuo-utente-smtp
SMTP_PASS=tua-password-smtp
SMTP_FROM=Client Manager <no-reply@tuodominio.com>
```

7. Se vuoi, lascia che Render gestisca `PORT` automaticamente. L'app legge gia `process.env.PORT`.

Alla fine otterrai un URL tipo:

```text
https://nome-backend.onrender.com
```

### Frontend Su Vercel

1. In Vercel crea un nuovo progetto partendo dallo stesso repository GitHub.
2. Quando importi il monorepo, imposta `Root Directory` su `client`.
3. Lascia framework `Vite` se viene rilevato automaticamente.
4. Aggiungi questa environment variable in Vercel:

```env
VITE_API_URL=https://nome-backend.onrender.com/api
```

5. Esegui il deploy.

Nel frontend e presente `client/vercel.json` per fare il rewrite verso `index.html`, utile per le route SPA come `/dashboard` quando ricarichi la pagina.

La route frontend `/verify-email` viene usata dai link di conferma inviati via email.

### Ordine Consigliato

1. Deploy backend su Render
2. Copia l'URL pubblico del backend
3. Deploy frontend su Vercel con `VITE_API_URL`
4. Copia l'URL pubblico del frontend
5. Torna su Render e aggiorna `CORS_ORIGIN` e `APP_BASE_URL` con l'URL Vercel definitivo
6. Ridistribuisci il backend

## Stato Attuale

Il frontend e gia collegato al backend per:

- login
- registrazione
- verifica email
- reinvio email di verifica
- recupero clienti
- creazione clienti
- aggiornamento clienti
- eliminazione clienti
