interface MailOptions {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachment: { filename: string; buffer: Buffer };
}

type MailType = "user" | "admin";

export class MailOptionsBuilder {
  static buildMailOptions(
    type: MailType,
    to: string,
    filename: string,
    buffer: Buffer,
    cc?: string
  ): MailOptions {
    if (type === "user") {
      return {
        to,
        cc,
        subject: "Onboarding With SpareCare",
        html: `
          <p>Hi Team,</p>
          <p>Welcome aboard !!</p>
          <p>Thank you for sharing the details for the business association with <strong>Spare Care</strong>.</p>
          <p>You may find the file attached to this email for your reference.</p>
          <p>In case you find any discrepancies in the data entered, you may please mail the correct details to <a href="mailto:manish.sharma@sparecare.in">manish.sharma@sparecare.in</a>.</p>
          <br/>
          <p>Thanks and Regards,<br/><strong>Team Spare Care</strong></p>
        `,
        attachment: { filename, buffer },
      };
    }

    if (type === "admin") {
      return {
        to,
        subject: "New Dealer Onboarded",
        html: `
          <p>Hello Admin,</p>
          <p>A new dealer has been successfully onboarded. Please review the attached file.</p>
          <br/>
          <p>Regards,<br/><strong>System</strong></p>
        `,
        attachment: { filename, buffer },
      };
    }

    throw new Error(`Unsupported mail type: ${type}`);
  }
}
