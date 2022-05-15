var api = require("../../node_modules/clicksend/api.js");

require("dotenv").config();

var smsApi = new api.SMSApi(process.env.MAIN_USER, process.env.MAIN_API_KEY);

var smsCollection = new api.SmsMessageCollection();

const smsMessage = new api.SmsMessage();

module.exports = async (to, message) => {
  smsMessage.to = to;
  smsMessage.from = "+254711516786";
  smsMessage.body = message;
  smsCollection.messages = [smsMessage];
  return await smsApi.smsSendPost(smsCollection);
};
