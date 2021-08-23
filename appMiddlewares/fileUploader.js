const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const fileFieldName = "image";

function determineWhereToSave() {
  let args = process.argv;
  const productionDestination = "images";
  const productFed = args[2].split("=")[1];
  if (productFed === productionDestination) return "data/".concat(productFed);
  const testFed = args[4].split("=")[1];
  return "data/".concat(testFed);
}
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, determineWhereToSave());
  },
  filename: (req, file, cb) => {
    // generate random numbers to make file names unique
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const filter = (req, file, cb) => {
  const fileType = file.mimetype;
  if (isImage(fileType)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const isImage = (fileType) => {
  return (
    fileType === "image/png" ||
    fileType === "image/jpg" ||
    fileType === "image/jpeg"
  );
};
const multerSettings = { storage: fileStorage, fileFilter: filter };
/**
 * @returns - returns an image uploader for express app
 */
const fileUploader = multer(multerSettings).single(fileFieldName);

// const imageResizer = async (req, res, next) => {
// 	try {
// 		const file = req.file;
// 		if (!file) {
// 			return next();
// 		}
// 		const { filename } = req.file;
// 		const imageUrl = path.resolve(req.file.destination, 'resized', filename);
// 		await sharp(file.path)
// 			.resize(200, 200)
// 			.jpeg({ quality: 90 })
// 			.toFile(imageUrl);
// 		fs.unlinkSync(file.path);
// 		req.imageUrl = imageUrl;
// 		next();
// 	} catch (error) {
// 		next(error);
// 	}
// };
module.exports = (app) => {
  app.use(fileUploader);
  // app.use(imageResizer);
};
