const mongoose = require('mongoose')
const Client = require('../models/Client')

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)
const normalizeString = (value) => typeof value === 'string' ? value.trim() : ''
const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : ''

const buildClientPayload = (body) => ({
  name: normalizeString(body.name),
  email: normalizeEmail(body.email),
  phone: normalizeString(body.phone),
  company: normalizeString(body.company),
  notes: normalizeString(body.notes)
})

exports.createClient = async (req, res) => {
  try {
    const payload = buildClientPayload(req.body)

    if (!payload.name) {
      return res.status(400).json({ message: 'Il nome del cliente e obbligatorio' })
    }

    const client = await Client.create({
      ...payload,
      user: req.user.id
    })

    res.status(201).json(client)
  } catch (err) {
    console.error('Errore durante la creazione del cliente:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(clients)
  } catch (err) {
    console.error('Errore durante il recupero dei clienti:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID cliente non valido' })
    }

    const payload = buildClientPayload(req.body)

    if (!payload.name) {
      return res.status(400).json({ message: 'Il nome del cliente e obbligatorio' })
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, user: req.user.id },
      payload,
      { new: true, runValidators: true }
    )

    if (!client) {
      return res.status(404).json({ message: 'Cliente non trovato' })
    }

    res.json(client)
  } catch (err) {
    console.error('Errore durante l\'aggiornamento del cliente:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID cliente non valido' })
    }

    const client = await Client.findOneAndDelete({ _id: id, user: req.user.id })

    if (!client) {
      return res.status(404).json({ message: 'Cliente non trovato' })
    }

    res.json({ message: 'Cliente eliminato con successo' })
  } catch (err) {
    console.error('Errore durante l\'eliminazione del cliente:', err.message)
    res.status(500).json({ message: 'Errore interno del server' })
  }
}
