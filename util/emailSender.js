// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
// const OAuth2 = google.auth.OAuth2;
// try {
//   const oauth2Client = new OAuth2(
//     "1062433344529-6qi9hg86u0bjfg5q8p8vvuapmos9ue4m.apps.googleusercontent.com",
//     "XEqwAjy4HGcIv7iLRb1v-yx0",
//     "http://localhost"
//   );
//   oauth2Client.setCredentials({
//     refresh_token:
//       "1//03myWUo74AX5FCgYIARAAGAMSNwF-L9Ir084NQ_ImQn7qnYn9SShWXFMKNr8y4hZwwcqRBGDCkif9HV84YsiKRzZbSiVQ44FRHpQ"
//   });
//   const accessToken = oauth2Client.getAccessToken();
//   module.exports = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       type: "OAuth2",
//       user: "samuelmainaonlineshop@gmail.com",
//       clientId:
//         "1062433344529-6qi9hg86u0bjfg5q8p8vvuapmos9ue4m.apps.googleusercontent.com",
//       clientSecret: "XEqwAjy4HGcIv7iLRb1v-yx0",
//       refreshToken:
//         "1//03myWUo74AX5FCgYIARAAGAMSNwF-L9Ir084NQ_ImQn7qnYn9SShWXFMKNr8y4hZwwcqRBGDCkif9HV84YsiKRzZbSiVQ44FRHpQ",
//       accessToken: accessToken
//     }
//   });

// } catch (error) {
//   console.log(error);
// }
