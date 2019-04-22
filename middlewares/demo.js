let checkDemo = (req, res, next) => {
    if (process.env.DEMO) {
        return res.status(404).json({ ok: false, message: 'Función no habilitada en la versión DEMO' })
    } else {
        next()
    }
}

module.exports = { checkDemo }