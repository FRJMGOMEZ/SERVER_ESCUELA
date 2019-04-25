let checkDemo = (req, res, next) => {

    if (req.user.userDb) {
        if (req.user.userDb.email === 'frjmartinezgomez@gmail.com') {
            next()
        } else {
            if (process.env.DEMO) {
                return res.status(403).json({ ok: false, message: 'Función no habilitada en la versión DEMO' })
            } else {
                next()
            }
        }
    } else {
        if (process.env.DEMO) {
            return res.status(403).json({ ok: false, message: 'Función no habilitada en la versión DEMO' })
        } else {
            next()
        }
    }
}

module.exports = { checkDemo }