const nodemailer = require("nodemailer");

const sendWelcomeEmail = async(toEmail, userName) =>{
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
                tls: {
                rejectUnauthorized: false
            }
        });

        const MailOptions = {
            from: process.env.MAIL_USER,
            to: toEmail,
            subject: "Welcome To Our Platform!",
            html: `
            <h2>Welcome, ${userName}!</h2>
            <p>We're excited to have you on board. Start exploring your dashboard now.</p>
        <p>Let us know if you need any help!</p>
        <br />
        <p>Regards,</p>
        <p><b>Team</b></p>
      `,  
    };

    await transporter.sendMail(MailOptions);
    console.log("✅ Welcome email sent to", toEmail);
  } catch (err) {
    console.error("❌ Failed to send welcome email:", err);
  }
};

module.exports = {sendWelcomeEmail};