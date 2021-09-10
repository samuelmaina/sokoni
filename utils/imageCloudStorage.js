require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploads = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        resource_type: "auto",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, id: result.public_id });
      }
    );
  });
};

exports.deleteFile = (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (err, result) => {
      if (err) return reject("Unable to delete image");
      resolve(result);
    });
  });
};

exports.checkIfExist = async (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resource(public_id, (err, result) => {
      if (err) return resolve(false);
      resolve(true);
    });
  });
};
