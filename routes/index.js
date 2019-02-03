const express = require('express');
const app = express();

app.use(require('./usuario'))
app.use(require('./login'))
app.use(require('./professors'))
app.use(require('./subjects'))
app.use(require('./facilities'))
app.use(require('./alumnis'));
app.use(require('./indexCards'));
app.use(require('./proyecto'));
app.use(require('./upload'));
app.use(require('./images'));
app.use(require('./search'));
app.use(require('./mensaje'));
app.use(require('./events'));
app.use(require('./calendars'));
app.use(require('./days'));

module.exports = app;