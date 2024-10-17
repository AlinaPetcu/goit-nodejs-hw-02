const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const contactsRouter = require('./routes/api/contacts'); // Asigură-te că calea este corectă

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(morgan(formatsLogger)); // Utilizează morgan pentru logging
app.use(cors()); // Permite CORS
app.use(express.json()); // Permite parsarea JSON

// Utilizare a routerului de contacte
app.use('/api/contacts', contactsRouter);

// Middleware pentru rutele necunoscute
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

// Exportă aplicația
module.exports = app;
