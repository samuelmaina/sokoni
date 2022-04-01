const { SMS_ACCOUNTSID, SMS_AUTHTOKEN } = require("../config/env");
const client = require("twilio")(SMS_ACCOUNTSID, SMS_AUTHTOKEN);

const sender = "+19377649987";

module.exports = async (message, toNumber) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: sender,
      to: toNumber,
    });
  } catch (error) {
    throw error;
  }
};
