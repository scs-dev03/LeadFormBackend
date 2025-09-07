import nodemailer from "nodemailer";
import { IMailService, SendMailInput } from "../../domain/repositories/IMailService";

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAILID,
    pass: process.env.EMAILPASSWORD,
  },
});

export class NodemailerMailService implements IMailService {
  async send(input: SendMailInput): Promise<void> {
    // console.log(process.env.EMAILID);
    // console.log(process.env.EMAILPASSWORD);
    await transporter.sendMail({
      from: input.from ?? process.env.EMAILID,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType ?? "application/pdf"
      }))
    });
  }
}
