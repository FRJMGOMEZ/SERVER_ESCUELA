const express = require('express');
const app = express();

app.use(require('./usuario'))
app.use(require('./login'))
app.use(require('./profesor'))
app.use(require('./materia'))
app.use(require('./instalaciones'))
app.use(require('./alumno'));
app.use(require('./ficha'));
app.use(require('./proyecto'));
app.use(require('./upload'));
app.use(require('./images'));
app.use(require('./search'));
app.use(require('./mensaje'));
app.use(require('./eventos'));
app.use(require('./calendarios'));
app.use(require('./days'));

module.exports = app;