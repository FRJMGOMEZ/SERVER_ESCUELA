const express = require('express');
const app = express();

app.use(require('./usuario'))
app.use(require('./login'))
app.use(require('./profesor'))
app.use(require('./pago'))
app.use(require('./materia'))
app.use(require('./clase'))
app.use(require('./alumno'));

module.exports = app;