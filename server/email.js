const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: 'rzbh eaph ygmc eakj'
    }
});

/**
 * Description. This functions sends an email to a user who is trying to create a new account
 *      or is trying to reset their email
 *      The email contains a link. If the user clicks the link their account should be officially
 *      registered on the server
 * @param {String} email_address The address to send email to
 * @param {String} activation_link The link for which a user must click to activate their account
 */
module.exports.send_verification_link = async (email_address,activation_link) => {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email_address,
        subject: "Verify your email for mark notes",
        html: `<p>Verify your email address to complete
                your signup</p>
                <p>This link <b> expires in 1 hour</b>.</p>
                <p> Click <a href =${activation_link}> here</a>
                to proceed.</p>`
    };

    await transporter.sendMail(mailOptions)
}

/**
 * Description. This function sends and email to a user who is trying to reset their *FORGOTTEN*
 *      password. If they click the link they should be able to reset their password.
 * @param {String} email_address the address to send email to
 * @param {String} reset_link The link for which a user must click to reset their password
 */
module.exports.send_reset_password_link = async (email_address, reset_link) => {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email_address,
        subject: "Reset your mark notes password",
        html: `<p>Click the link to reset your password</p>
                <p>This link <b> expires in 10 minutes</b>.</p>
                <p> Click <a href =${reset_link}> here</a>
                to proceed.</p>`
    };

    await transporter.sendMail(mailOptions)
}