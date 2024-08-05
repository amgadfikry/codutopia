import mailgun from 'mailgun-js';

class EmailUtils {

  constructor() {
    this.domain = 'amgadfikry.me'
    this.sender = 'Codutopia Platform <email@amgadfikry.me>'
    this.mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: this.domain });
  }

  /* sendConfirmationEmail: Send a confirmation email to the user
      Parameters:
        - name: The name of the user
        - email: The email address of the user
      Returns:
        - The response from the Mailgun API
      Errors:
        - Failed to send confirmation email
  */
  async sendConfirmationEmail(name, code, email) {
    const data = {
      from: this.sender,
      to: email,
      subject: "Codutopia Account Confirmation",
      template: "codutpoia_confirmation",
      'h:X-Mailgun-Variables': JSON.stringify({ userName: name, code: code })
    };
    try {
      const response = await this.mg.messages().send(data);
      return response;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to send confirmation email');
    }
  }

}

// Create an instance of the EmailUtils class
const emailUtils = new EmailUtils();
export default emailUtils;
