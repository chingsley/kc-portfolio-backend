const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class Email {
  FRONTEND_URL = 'localhost:3000/passwordreset';

  static async send({ email, message, html }) {
    try {
      if (!message && !html) {
        throw new Error('mail sender was called without a message or html');
      }
      if (!email) {
        throw new Error('email must be provided');
      }
      const msg = {
        to: email,
        from: process.env.SENDER_ADDRESS,
        subject: 'NNS Management System',
        text: message || html,
        html: html || '',
      };
      await sgMail.send(msg);
    } catch (error) {
      return error;
    }
  }

  static getPasswordResetTemplate(resetToken) {
    const msg = `
  
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {background-color: red; padding: 5px;}
        div {color: white; padding: 15px; padding-left: 10px; width: 80%; border-radius: 5px;}
        h1   {color: dark red;}
      </style>
    </head>
    <body>
      <div style="background-color: #130f40;">
          <p>click the link below to reset your password</p>
          <a href="${process.env.HOST_URL_FRONTEND}/resetpassword/${resetToken}">${process.env.HOST_URL_FRONTEND}/resetpassword/${resetToken}</a>
        <div />
    </body>
  </html>
  `;

    return msg;
  }
}
