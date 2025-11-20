import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn('WhatsApp service not configured. Messages will be logged only.');
}

export const sendWhatsAppMessage = async (to, templateData) => {
  const { type, ...data } = templateData;

  if (!twilioClient) {
    console.log(`[MOCK WHATSAPP] To: ${to}, Type: ${type}`, data);
    return { success: true, mock: true };
  }

  try {
    let messageBody = '';

    switch (type) {
      case 'opt_in_request':
        messageBody = `Hello! ${data.recruiterName} from ${data.companyName} is interested in connecting with you about a ${data.jobTitle} position. Check your PlacedAI dashboard for details.`;
        break;
      case 'opt_in_accepted':
        messageBody = `Great news! ${data.candidateName} has accepted your opt-in request. Check your dashboard for their profile.`;
        break;
      default:
        messageBody = data.message || 'You have a new notification from PlacedAI. Please check your dashboard.';
    }

    // Format phone number (ensure it starts with whatsapp:)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    const message = await twilioClient.messages.create({
      body: messageBody,
      from: from,
      to: formattedTo
    });

    console.log(`WhatsApp message sent: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

