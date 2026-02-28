import 'dotenv/config';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

console.log('Fetching recent WhatsApp messages...\n');

// Fetch the last 10 messages
client.messages
    .list({ limit: 10 })
    .then(messages => {
        console.log(`Found ${messages.length} recent messages:\n`);

        messages.forEach(msg => {
            console.log('─'.repeat(60));
            console.log(`SID: ${msg.sid}`);
            console.log(`From: ${msg.from}`);
            console.log(`To: ${msg.to}`);
            console.log(`Status: ${msg.status}`);
            console.log(`Body: ${msg.body}`);
            console.log(`Sent: ${msg.dateSent}`);
            if (msg.errorCode) {
                console.log(`❌ Error Code: ${msg.errorCode}`);
                console.log(`❌ Error Message: ${msg.errorMessage}`);
            }
            console.log('');
        });

        console.log('─'.repeat(60));
        console.log('\nStatus meanings:');
        console.log('  queued     - Waiting to be sent');
        console.log('  sent       - Sent to carrier');
        console.log('  delivered  - Successfully delivered ✅');
        console.log('  failed     - Failed to send ❌');
        console.log('  undelivered- Could not deliver ❌');
    })
    .catch(error => {
        console.error('Error fetching messages:', error.message);
    });
