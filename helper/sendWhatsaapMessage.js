const accountSid = process.env.TRIVIA_ACCOUNT_SID;
const authToken = process.env.TRIVIA_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendWhatsappMessage = (message) => {
  client.messages
    .create({
      body: message,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+919106963839",
    })
    .done();
};
module.exports = { sendWhatsappMessage };
