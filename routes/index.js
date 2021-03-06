const express = require('express');
const app = express();

app.use(require('./users'))
app.use(require('./login'))
app.use(require('./professors'))
app.use(require('./subjects'))
app.use(require('./facilities'))
app.use(require('./alumnis'));
app.use(require('./cards'));
app.use(require('./projects'));
app.use(require('./files'));
app.use(require('./search'));
app.use(require('./message'));
app.use(require('./events'));
app.use(require('./weeks'));
app.use(require('./days'));
app.use(require('./tasks'));
app.use(require('./password'));
app.use(require('./artists'));
app.use(require('./albums'));
app.use(require('./tracks'));
app.use(require('./assignations'));
app.use(require('./incomes'));
app.use(require('./debitors'));
app.use(require('./payments'));
app.use(require('./letters'));
app.use(require('./visitors'));

module.exports = app;