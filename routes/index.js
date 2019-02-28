const express = require('express');
const app = express();

app.use(require('./users'))
app.use(require('./login'))
app.use(require('./professors'))
app.use(require('./subjects'))
app.use(require('./facilities'))
app.use(require('./alumnis'));
app.use(require('./indexCards'));
app.use(require('./projects'));
app.use(require('./uploads'));
app.use(require('./images'));
app.use(require('./search'));
app.use(require('./message'));
app.use(require('./events'));
app.use(require('./weeks'));
app.use(require('./days'));

module.exports = app;