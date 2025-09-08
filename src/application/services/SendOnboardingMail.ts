import { IMailService } from "../../domain/repositories/IMailService";

export class SendOnboardingMail {
    constructor(private mail: IMailService) {}

    async execute(params: {
        to: string;
        cc?: string;
        subject: string;
        html: string;
        attachments: { filename: string; buffer: Buffer }[]; // plural
    }) {
        try {
            await this.mail.send({
                to: params.to,
                cc: params.cc,
                subject: params.subject,
                html: params.html,
                attachments: params.attachments.map(att => ({
                    filename: att.filename,
                    content: att.buffer // Nodemailer expects `content`
                }))
            });
        } catch (err) {
            throw err;
        }
    }
}
