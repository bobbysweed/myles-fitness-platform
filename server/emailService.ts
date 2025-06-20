import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email notifications will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("Email would be sent:", params.subject, "to", params.to);
    return true; // Return true in development/testing
  }

  try {
    await mailService.send({
      to: params.to,
      from: 'noreply@mylesfitness.co.uk',
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log("Email sent successfully:", params.subject, "to", params.to);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    // Log more detailed error information
    if (error?.response?.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
}
