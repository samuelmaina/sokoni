const multer = require("multer");

const fileDestination = "Data/Images";
const fileFieldName = "image";
const filter = (req, file, cb) => {
  const fileType = file.mimetype;
  if (isImage(fileType)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const isImage = fileType => {
  return (
    fileType === "image/png" ||
    fileType === "image/jpg" ||
    fileType === "image/jpeg"
  );
};
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileDestination);
  },
  filename: (req, file, cb) => {
    // generate random numbers to make file names unique
    cb(null, Math.random() + "-" + file.originalname);
  },
});
const multerSettings = {storage: fileStorage, fileFilter: filter};
/**
 * @returns - returns an image uploader for express app
 */
const fileUploader = multer(multerSettings).single(fileFieldName);
module.exports = app => {
  app.use(fileUploader);
};
