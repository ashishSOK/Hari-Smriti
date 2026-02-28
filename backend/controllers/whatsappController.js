import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Helper to simulate sending message in dev mode
const sendMessage = async (to, body) => {
    // Check if we are using dummy credentials
    if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC_dummy')) {
        console.log(`[DEV MODE] Mock WhatsApp Message to ${to}: ${body}`);
        return { sid: 'SM_MOCK_' + Date.now() }; // Return fake SID
    }

    return await client.messages.create({
        body,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to
    });
};

// @desc    Send WhatsApp message to specific devotee
// @route   POST /api/whatsapp/send
// @access  Private (Mentor only)
export const sendWhatsAppMessage = async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ message: 'Phone number and message are required' });
        }

        // Ensure phone number is in correct format
        const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;

        const twilioMessage = await sendMessage(formattedPhone, message);

        res.json({
            success: true,
            messageSid: twilioMessage.sid,
            message: 'WhatsApp message sent successfully'
        });
    } catch (error) {
        console.error('WhatsApp send error:', error);
        res.status(500).json({
            message: 'Failed to send WhatsApp message',
            error: error.message
        });
    }
};

// @desc    Send bulk WhatsApp messages
// @route   POST /api/whatsapp/send-bulk
// @access  Private (Mentor only)
export const sendBulkWhatsAppMessages = async (req, res) => {
    try {
        const { recipients, message } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'Recipients array is required' });
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const results = [];

        for (const recipient of recipients) {
            try {
                const formattedPhone = recipient.phone.startsWith('whatsapp:')
                    ? recipient.phone
                    : `whatsapp:${recipient.phone}`;

                const personalizedMessage = message.replace('{name}', recipient.name || 'devotee');

                const twilioMessage = await sendMessage(formattedPhone, personalizedMessage);

                results.push({
                    phone: recipient.phone,
                    name: recipient.name,
                    success: true,
                    messageSid: twilioMessage.sid
                });
            } catch (error) {
                results.push({
                    phone: recipient.phone,
                    name: recipient.name,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;

        res.json({
            totalSent: recipients.length,
            successCount,
            failedCount: recipients.length - successCount,
            results
        });
    } catch (error) {
        console.error('Bulk WhatsApp send error:', error);
        res.status(500).json({
            message: 'Failed to send bulk WhatsApp messages',
            error: error.message
        });
    }
};

// @desc    Send reminder to devotees who haven't submitted
// @route   POST /api/whatsapp/send-reminder
// @access  Private (Mentor only)
export const sendReminderToMissingDevotees = async (req, res) => {
    try {
        const { devotees, customMessage } = req.body;

        const defaultMessage = `Hare Krishna {name},\n\nThis is a gentle reminder to submit your Sadhna report for today. Please fill in your spiritual practice details at your earliest convenience.\n\nYour servant,\n${req.user.name}`;

        const message = customMessage || defaultMessage;

        const recipients = devotees.map(d => ({
            phone: d.phone,
            name: d.name
        }));

        // Use the bulk send function
        const results = [];

        for (const recipient of recipients) {
            try {
                const formattedPhone = recipient.phone.startsWith('whatsapp:')
                    ? recipient.phone
                    : `whatsapp:${recipient.phone}`;

                const personalizedMessage = message.replace('{name}', recipient.name);

                const twilioMessage = await sendMessage(formattedPhone, personalizedMessage);

                results.push({
                    phone: recipient.phone,
                    name: recipient.name,
                    success: true,
                    messageSid: twilioMessage.sid
                });
            } catch (error) {
                results.push({
                    phone: recipient.phone,
                    name: recipient.name,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;

        res.json({
            totalSent: recipients.length,
            successCount,
            failedCount: recipients.length - successCount,
            results
        });
    } catch (error) {
        console.error('Reminder send error:', error);
        res.status(500).json({
            message: 'Failed to send reminders',
            error: error.message
        });
    }
};
