const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY } = require("../config/env");

sgMail.setApiKey(SENDGRID_API_KEY);

module.exports = async (msg) => {
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;

// const createTransporter = async () => {
// 	const oauth2Client = new OAuth2(
// 		process.env.CLIENT_ID,
// 		process.env.CLIENT_SECRET,
// 		'https://developers.google.com/oauthplayground'
// 	);

// 	oauth2Client.setCredentials({
// 		refresh_token: process.env.REFRESH_TOKEN,
// 	});

// 	const accessToken = await new Promise((resolve, reject) => {
// 		oauth2Client.getAccessToken((err, token) => {
// 			if (err) {
// 				reject(err);
// 			}
// 			resolve(token);
// 		});
// 	});

// 	const transporter = nodemailer.createTransport({
// 		service: 'gmail',
// 		auth: {
// 			type: 'OAuth2',
// 			user: process.env.EMAIL,
// 			accessToken,
// 			clientId: process.env.CLIENT_ID,
// 			clientSecret: process.env.CLIENT_SECRET,
// 			refreshToken: process.env.REFRESH_TOKEN,
// 		},
// 	});

// 	return transporter;
// };

// module.exports = async (emailOptions) => {
//   let transporter = await createTransporter();
//   await transporter.sendMail(emailOptions);
// };
