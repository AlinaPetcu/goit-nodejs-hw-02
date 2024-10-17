const express = require('express');
const fs = require('fs').promises; // Import fs.promises pentru a lucra cu fișiere
const path = require('path');
const Joi = require('joi'); // Importăm joi pentru validarea datelor
const router = express.Router();

// Definim calea către fișierul contacts.json
const contactsPath = path.join(__dirname, '../../models/contacts.json');

// Funcția pentru a lista toate contactele
async function listContacts() {
  const data = await fs.readFile(contactsPath, 'utf-8');
  return JSON.parse(data);
}

// Schema de validare pentru un contact
const contactSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

// Rutele API

// GET /api/contacts - Obține toate contactele
router.get('/', async (req, res, next) => {
  try {
    const allContacts = await listContacts();
    res.status(200).json(allContacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:contactId - Obține un contact după ID
router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await listContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - Adaugă un nou contact
router.post('/', async (req, res, next) => {
  try {
    // Validăm datele primite folosind schema
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone } = req.body;
    const contacts = await listContacts();
    const newContact = { id: Date.now().toString(), name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:contactId - Șterge un contact după ID
router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await listContacts();
    const newContacts = contacts.filter(c => c.id !== contactId);
    if (contacts.length === newContacts.length) {
      return res.status(404).json({ message: 'Not found' });
    }
    await fs.writeFile(contactsPath, JSON.stringify(newContacts, null, 2));
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:contactId - Actualizează un contact după ID
router.put('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;

  try {
    // Validăm datele primite folosind schema
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone } = req.body;
    const contacts = await listContacts();
    const index = contacts.findIndex(c => c.id === contactId);
    if (index === -1) {
      return res.status(404).json({ message: 'Not found' });
    }
    contacts[index] = { id: contactId, name, email, phone };
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    res.status(200).json(contacts[index]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
