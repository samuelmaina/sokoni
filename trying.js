var api = require("./node_modules/clicksend/api.js");

require("dotenv").config();

var smsApi = new api.SMSApi(process.env.MAIN_USER, process.env.MAIN_API_KEY);

var smsCollection = new api.SmsMessageCollection();

const smsMessage = new api.SmsMessage();

smsMessage.to = "+254711516786";
smsMessage.from = "+254743383947";
smsMessage.body = "Mimi ni paps";
smsCollection.messages = [smsMessage];

smsApi
  .smsSendPost(smsCollection)
  .then((response) => {
    console.log(response.body);
  })
  .catch((err) => {
    console.log(err);
  });
