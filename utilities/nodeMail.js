if (process.env.NODE_ENV === 'desarrollo') {
    require('../config/mailjetUser')
}

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
        let mailOptions = {
            from: 'frjmartinezgomez@gmail.com',
            to: user.email,
            subject: title,
            text: message
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