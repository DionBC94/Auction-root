const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cors = require('cors');  // Add this line to import cors

dotenv.config(); // Load environment variables

const app = express();

// Enable CORS for all routes
app.use(cors());  // This line allows cross-origin requests

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

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

// Example API route for subscribing (handles POST requests)
app.post('/apisubscribe', (req, res) => {
  const { email } = req.body;

  // Basic email validation
  if (!email || !email.includes('@')) {
    return res.status(400).send('Invalid email address');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,    // Sender email
    to: email,                       // Recipient email
    subject: 'Pledge Notification',
    text: 'You will be notified if a pledge secures this fortnight.',
  };

  // Send email using Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending email');
    }
    console.log('Email sent: ' + info.response);
    return res.status(200).send('Email sent successfully');
  });
});

// Example API route for updating pledges (POST request)
app.post('/apiupdate-pledge', (req, res) => {
  const { fortnightId, name, pledge } = req.body;

  // Simulate retrieving fortnight data (this could be from a database)
  let fortnight = { id: fortnightId, name, status: 'Unsecured', highestPledge: 0, email: null };

  if (pledge > fortnight.highestPledge) {
    fortnight.highestPledge = pledge;
    fortnight.name = name;
    fortnight.status = 'Secured';

    // Send an email notification if the pledge is updated
    if (fortnight.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: fortnight.email,
        subject: `Fortnight ${fortnight.id} Pledge Update`,
        text: `Your pledge has been usurped. New details:\nName: ${fortnight.name}\nHighest Pledge: EUR ${fortnight.highestPledge}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).send('Error sending email');
        }
        console.log('Email sent: ' + info.response);
      });
    }

    return res.status(200).json({ message: 'Pledge updated successfully', fortnight });
  } else {
    return res.status(400).json({ error: 'Pledge not high enough' });
  }
});

// Catch-all route to serve the frontend (index.html) for any unmatched requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
