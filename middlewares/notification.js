const nodemailer = require('nodemailer');

module.exports = (mensaje) => {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'frjmartinezgomez@gmail.com', // Cambialo por tu email
            pass: 'Gondorgenwein123Billyshears123' // Cambialo por tu password
        }
    });
    const mailOptions = {
        from: `${mensaje.email}`,
        to: `${mensaje.destinatario}`, // Cambia esta parte por el destinatario
        subject: '',
        html: `
 <strong>Nombre:</strong> ${mensaje.nombre} <br/>
 <strong>E-mail:</strong> ${mensaje.email} <br/>
 <strong>Mensaje:</strong> ${mensaje.mensaje}
 `
    };
    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}