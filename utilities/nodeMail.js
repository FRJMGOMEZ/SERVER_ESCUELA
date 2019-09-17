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


const sendEmail = (res, userMail, title,from,message,template) => {
    return new Promise(async(resolve, reject) => {
        let mailOptions = {
            to: 'usuariotestcargomusicapp@gmail.com',
            subject: title,
        };

        mailOptions.from = await from? from :'frjmartinezgomez@gmail.com';
        mailOptions.text = await message ? message  : '';
        mailOptions.html =  await template ? template : ''; 
        
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