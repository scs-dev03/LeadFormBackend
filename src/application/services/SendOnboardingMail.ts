import { IMailService } from "../../domain/repositories/IMailService";

export class SendOnboardingMail {
    constructor(private mail: IMailService) { }

    async execute(params: {
        to: string;
        cc?: string;
        subject: string;
        html: string;
        attachment: { filename: string; buffer: Buffer };
    }) {
        try {
            await this.mail.send({
                to: params.to,
                cc: params.cc,
                subject: params.subject,
                html: params.html,
                attachments: [
                    { filename: params.attachment.filename, content: params.attachment.buffer }
                ]
            });
            // console.log("Onboarding email sent successfully");
        } catch (err) {
            // console.log(err);
            throw err;
        }
    }
}
