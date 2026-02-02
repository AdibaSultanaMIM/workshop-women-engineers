const mysql = require('mysql2/promise');
const { Resend } = require('resend');

// REMOVE the line below from outside the function:
// const resend = new Resend(process.env.RESEND_API_KEY); 

export default async function handler(req, res) {
  // MOVE IT INSIDE THE HANDLER
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (req.method === 'POST') {
    try {
      const { name, email, phone, institution, topic } = req.body;
      
      // 1. Connect to MySQL
      const connection = await mysql.createConnection(process.env.DATABASE_URL);

      // 2. Insert Data
      await connection.execute(
        'INSERT INTO registrations (full_name, university_email, phone, institution, topic) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, institution, topic]
      );

      // 3. Send Confirmation Email
      await resend.emails.send({
        from: 'WE-ICT <onboarding@resend.dev>',
        to: [email],
        subject: 'Registration Confirmed - WE-ICT 2026',
        html: `<p>Hi ${name}, your registration for WE-ICT 2026 at BUET is confirmed!</p>`
      });

      await connection.end();
      return res.status(200).json({ message: 'Success' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
