const { notImage } = require("../../config/constraints");
const { Product } = require("../../database/models");
const {
  validationResults,
  cloudUploader,
  fileManipulators,
} = require("../../utils");

const { uploads } = cloudUploader;

exports.addProduct = async (req) => {
  const { body, file, sizeError, isNotImage } = req;
  const missingImageError = "Please enter an image for your product.";
  const validationErrors = validationResults(req);
  const results = {};
  if (sizeError) {
    results.error = sizeError;
    return results;
  }

  if (isNotImage) {
    results.error = notImage.error;
    return results;
  }

  if (validationErrors) {
    results.error = validationErrors;
    return results;
  }
  if (!file) {
    results.error = missingImageError;
    return results;
  }
  const productData = body;
  productData.adminId = req.session.admin._id;
  const uploadResult = await UploadToCloudAndDeleteFile(file.path);
  productData.imageUrl = uploadResult.url;
  productData.public_id = uploadResult.id;
  await Product.createOne(productData);
  results.info = "Product added successfully.";
  return results;
};

exports.getEditPage = async (req) => {
  const result = {};
  const prodId = req.params.id;
  const adminId = req.session.admin._id;
  const product = await Product.findById(prodId);

  if (!product || !product.isCreatedByAdminId(adminId)) {
    const error = {
      message: "Product not there or you are not authorised to modify it",
      redirect: "/admin/products",
    };
    result.error = error;
    return result;
  }
  result.product = product;
  return result;
};

async function UploadToCloudAndDeleteFile(path) {
  const uploadResult = await uploads(path);
  await fileManipulators.deleteFile(fileManipulators.resolvePath(path));
  return uploadResult;
}
