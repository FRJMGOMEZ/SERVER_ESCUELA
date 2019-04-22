require('../config/config');

const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
    service: '"Mailjet"',
    auth: {
        user: process.env.MAILJETUSER,
        pass: process.env.MAILJETPASSWORD,
    }
});

const sendEmail = (res, user, message, title) => {
    return new Promise((resolve, reject) => {
        // setup email data with unicode symbols
        let mailOptions = {
            from: 'frjmartinezgomez@gmail.com', // sender address
            to: user.email, // list of receivers
            subject: title, // Subject line
            text: message, // plain text body
            //html: '<b>Hello world?</b>' // html body
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(res.status(500).json({ ok: false, error }))
            } else {
                resolve()
            }
        });
    })
}

module.exports = { sendEmail }