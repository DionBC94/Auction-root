const nodemailer = require('nodemailer');

// Email transport setup using Nodemailer and ProtonMail Bridge credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   // From .env file
  port: process.env.SMTP_PORT,   // From .env file
  secure: false,                 // ProtonMail Bridge handles encryption
  auth: {
    user: process.env.EMAIL_USER,  // From .env file
    pass: process.env.EMAIL_PASS,  // From .env file
  },
  tls: {
    rejectUnauthorized: false,  // Allow self-signed certificates (important for ProtonMail Bridge)
  }
});

// Send a test email
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'recipient@example.com',  // Replace with your recipient email address
  subject: 'Test Email',
  text: 'This is a test email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error sending test email:', error);
  } else {
    console.log('Test email sent:', info.response);
  }
});
