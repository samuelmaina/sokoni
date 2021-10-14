exports.makePaymentWithMpesa = async (req) => {
  const number = req.user.tel;

  class MpesaController {
    async getOAuthToken(req, res, next) {
      let consumer_key = process.env.consumer_key;
      let consumer_secret = process.env.consumer_secret;

      let url = process.env.oauth_token_url;
      const encrypted_url = process.env.encrypted_url;

      //form a buffer of the consumer key and secret
      let buffer = new Buffer.from(consumer_key + ":" + consumer_secret);

      let auth = `Basic ${buffer.toString("base64")}`;

      try {
        let { data } = await axios.get(url, {
          headers: {
            Authorization: auth,
          },
        });

        req.token = data["access_token"];
        next();
      } catch (err) {
        return res.send({
          success: false,
          message: err["response"]["statusText"],
        });
      }
    }

    async lipaNaMpesaOnline(req, res) {
      let token = req.token;
      let auth = `Bearer ${token}`;

      //getting the timestamp
      let timestamp = require("../middleware/timestamp").timestamp;

      let url = process.env.lipa_na_mpesa_url;
      let bs_short_code = process.env.lipa_na_mpesa_shortcode;
      let passkey = process.env.lipa_na_mpesa_passkey;
      const encrypted_url = process.env.encrypted_url;
      let password = new Buffer.from(
        `${bs_short_code}${passkey}${timestamp}`
      ).toString("base64");
      let transcation_type = "CustomerPayBillOnline";
      let amount = "1"; //you can enter any amount
      let partyA = "254711516786"; //should follow the format:2547xxxxxxxx
      let partyB = process.env.lipa_na_mpesa_shortcode;
      let phoneNumber = "254711516786"; //should follow the format:2547xxxxxxxx
      let callBackUrl = encrypted_url + "/mpesa/lipa-na-mpesa-callback";
      console.log(callBackUrl);
      let accountReference = "lipa-na-mpesa-tutorial";
      let transaction_desc = "Testing lipa na mpesa functionality";

      try {
        let { data } = await axios.post(
          url,
          {
            BusinessShortCode: bs_short_code,
            Password: password,
            Timestamp: timestamp,
            TransactionType: transcation_type,
            Amount: amount,
            PartyA: partyA,
            PartyB: partyB,
            PhoneNumber: phoneNumber,
            CallBackURL: callBackUrl,
            AccountReference: accountReference,
            TransactionDesc: transaction_desc,
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        );

        return res.send({
          success: true,
          message: data,
        });
      } catch (err) {
        return res.send({
          success: false,
          message: err,
        });
      }
    }

    lipaNaMpesaOnlineCallback(req, res, next) {
      try {
        if (req.body.Body) {
          console.log("The request was sussessful.");
        } else
          console.log(
            "Safaricom is lying to us that the request has not been proceed.I am the one testing."
          );

        //Get the transaction description
        let message = req.body;

        return res.send({
          success: true,
          message: message.Body.stkCallback,
        });
      } catch (error) {
        return res.send({
          success: false,
          message: error,
        });
      }
    }
  }

  module.exports = new MpesaController();
};
