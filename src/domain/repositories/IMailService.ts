export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendMailInput {
  from?: string;
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}

export interface IMailService {
  send(input: SendMailInput): Promise<void>;
}
