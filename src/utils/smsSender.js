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

// const axios = require("axios");

// module.exports = async (message, toNumber) => {
//   try {
//     const options = {
//       method: "POST",
//       url: "https://d7sms.p.rapidapi.com/secure/send",
//       headers: {
//         "content-type": "application/json",
//         Authorization: "undefined",
//         "X-RapidAPI-Host": "d7sms.p.rapidapi.com",
//         "X-RapidAPI-Key": "266e74b50emsh20850296419068cp1c2bc5jsnf08613ac8126",
//       },
//       data: `{"content":${message},"from":"D7-Rapid","to":${toNumber}}`,
//     };
//     const res = await axios.request(options);
//     if (res) {
//       console.log(res);
//     }
//     {
//       console.log("Did not receive any res");
//     }
//   } catch (error) {
//     throw error;
//   }
// };
