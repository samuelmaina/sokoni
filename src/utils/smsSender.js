const accountSid = "AC177d0310a30cdba2aafc543cffe1e0dc";
const authToken = "27cde09697195386627af59b0d2f8e8a";

const messagingServiceSid = "MGbbe062c2830f0386bbded73451a81dd5";
const client = require("twilio")(accountSid, authToken);

module.exports = async (message, toNumber) => {
  try {
    const response = await client.messages.create({
      body: message,
      messagingServiceSid,
      to: toNumber,
    });
    if (response) {
      console.log(response);
    }
  } catch (error) {
    throw error;
  }
};
