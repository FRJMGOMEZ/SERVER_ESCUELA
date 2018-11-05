let timeStamp = (req, res, next) => {

    let usuario = req.usuario.usuario;

    let date = new Date()

    let stringDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`

    let timeStamp = { id: usuario._id, fecha: stringDate };

    req.timeStamp = timeStamp;

    next();
}


module.exports = timeStamp