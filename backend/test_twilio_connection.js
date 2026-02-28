
import 'dotenv/config';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('Testing Twilio Connection...');
console.log(`Account SID: ${accountSid ? (accountSid.substring(0, 6) + '...') : 'Missing'}`);
console.log(`From Number: ${fromNumber}`);

if (!accountSid || !authToken) {
    console.error('Missing credentials!');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

// Try to simply fetch the account details to verify credentials
client.api.v2010.accounts(accountSid)
    .fetch()
    .then(account => {
        console.log(`✅ Credentials Valid! Account Name: ${account.friendlyName}`);
        console.log(`Type: ${account.type}`);
        console.log(`Status: ${account.status}`);

        // Try sending a message to the likely user number (from previous .env)
        const toNumber = 'whatsapp:+917717232538';
        console.log(`\nAttempting to send test message to ${toNumber} from ${fromNumber}...`);

        return client.messages.create({
            body: 'Hello from your Hari Smriti! If you see this, integration is working.',
            from: fromNumber,
            to: toNumber
        });
    })
    .then(message => {
        console.log(`✅ Message Request Accepted!`);
        console.log(`SID: ${message.sid}`);
        console.log(`Status: ${message.status}`);
        console.log(`\nIMPORTANT: If status is 'queued' or 'sent' but you don't receive it,`);
        console.log(`it implies the recipient (${'whatsapp:+917717232538'}) has NOT joined the sandbox.`);
    })
    .catch(error => {
        console.error('❌ Verification/Sending Failed:');
        console.error(`Code: ${error.code}`);
        console.error(`Message: ${error.message}`);
        console.error(error);
        if (error.code === 63015) {
            console.error('\n--> Twilio Error 63015: The "From" number is not a valid WhatsApp-enabled sender.');
            console.error('    Please double check the Sandbox number in your .env file.');
        }
        if (error.code === 21608) {
            console.error('\n--> Twilio Error 21608: The verified sandbox number is broken or not linked.');
        }
    });
