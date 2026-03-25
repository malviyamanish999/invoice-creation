import nodemailer from 'nodemailer';

export class SendEmail {
  public sendMailSmtp = async () => {
    return nodemailer.createTransport({
      host: process.env.SmtpHost,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SmtpUsername,
        pass: process.env.SmtpPassword,
      },
    });
  };
  static sendMailSmtp: any;
}

export default SendEmail;
