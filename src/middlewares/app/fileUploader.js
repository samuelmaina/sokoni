const multer = require("multer");

const path = require("path");
const { maxImageSize } = require("../../config/constraints");

const { lengthInBytes, error } = maxImageSize;

const fileFieldName = "image";

function determineWhereToSave() {
  let args = process.argv;
  const productionDestination = "images";
  const productFed = args[2].split("=")[1];

  const folder = "src/data/";
  if (productFed === productionDestination) return folder.concat(productFed);
  const testFed = args[4].split("=")[1];
  return folder.concat(testFed);
}
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, determineWhereToSave());
  },
  filename: (req, file, cb) => {
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
    req.isNotImage = true;
    cb(null, false);
  }
};
const isImage = (type) => {
  return type === "image/png" || type === "image/jpg" || type === "image/jpeg";
};
const multerSettings = {
  storage: fileStorage,
  fileFilter: filter,
  limits: {
    files: 1,
    fileSize: lengthInBytes,
  },
};
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

module.exports = (req, res, next) => {
  fileUploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      req.sizeError = error;
    } else if (err) {
      return next(err);
    }
    next();
  });
};
