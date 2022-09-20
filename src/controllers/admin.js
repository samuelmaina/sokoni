const {
  cloudUploader,
  validationResults,
  Renderer,
  Flash,
  fileManipulators,
} = require("../utils");

const { Product, AdminSales, Metadata } = require("../database/models");
const { notImage } = require("../config/constraints");
const { adminServices } = require("../services");

const { resolvePath, deleteFile } = fileManipulators;

const returnAdminIdIfAdminIsInSession = (req) => {
  if (req.session && req.session.admin._id) return req.session.admin._id;
  return null;
};

exports.getAdminPage = (req, res, next) => {
  try {
    new Renderer(res)
      .templatePath("admin/home")
      .pageTitle("Admin Actions")
      .render();
  } catch (err) {
    next(err);
  }
};

exports.getAddProduct = (req, res, next) => {
  try {
    new Renderer(res)
      .templatePath("admin/edit-product")
      .pageTitle("Add Product")
      .pathToPost("/admin/add-product")
      .activePath("/add-product")
      .appendDataToResBody({ editing: false, name: req.session.admin.name })
      .render();
  } catch (err) {
    next(err);
  }
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { body } = req;
    const flash = new Flash(req, res).appendPreviousData(body);
    const results = await adminServices.addProduct(req);
    if (results.error) {
      return flash.appendError(results.error).redirect("add-product");
    }
    if (results.info) {
      return flash.appendSuccess(results.info).redirect("/admin/products");
    }
  } catch (error) {
    next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const { edit, page } = req.query;
    const result = await adminServices.getEditPage(req);

    if (result.error) {
      const error = result.error;
      return flash.appendError(error.error).redirect(error.redirect);
    }
    if (result.product)
      return new Renderer(res)
        .templatePath("admin/edit-product")
        .pageTitle("Edit Product")
        .pathToPost("/admin/edit-product")
        .activePath("/products")
        .appendPreviousData(result.product)
        .appendDataToResBody({
          editing: edit,
          page,
          name: req.session.admin.name,
        })
        .render();
  } catch (error) {
    next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const { body, file, sizeError, isNotImage } = req;
    const { page, id } = body;
    const editMode = true;
    let image = file;

    const renderer = new Renderer(res)
      .templatePath("admin/edit-product")
      .pageTitle("Edit Product")
      .pathToPost("/admin/edit-product")
      .activePath("/products")
      .appendPreviousData(req.body)
      .appendDataToResBody({
        editing: editMode,
        page,
        name: req.session.admin.name,
      });
    const productData = body;

    const adminId = returnAdminIdIfAdminIsInSession(req);

    if (sizeError) {
      return renderer.appendError(sizeError).render();
    }
    if (isNotImage) {
      return renderer.appendError(notImage.error).render();
    }

    const validationErrors = validationResults(req);
    if (validationErrors) {
      return renderer.appendError(validationErrors).render();
    }

    const product = await Product.findById(id);

    if (image) {
      const uploadResult = await UploadToCloudAndDeleteFile(image.path);
      productData.imageUrl = uploadResult.url;
      productData.public_id = uploadResult.id;
      await cloudUploader.deleteFile(product.public_id);
    }

    if (!product || !product.isCreatedByAdminId(adminId)) {
      return renderer
        .appendError(
          "Product is not there or you are not not allowed to modify it"
        )
        .render();
    }

    await product.updateDetails(productData);

    new Flash(req, res)
      .appendSuccess("Product updated successfully.")
      .redirect(`/admin/products?page=${page}`);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const renderer = new Renderer(res);
    const adminId = returnAdminIdIfAdminIsInSession(req);
    const page = +req.query.page || 1;
    const categories = await Product.findCategoriesForAdminId(adminId);
    const productsData = await Product.findPageProductsForAdminId(
      adminId,
      page
    );
    renderer
      .templatePath("admin/products")
      .pageTitle("Your Products")
      .activePath("/admin/products")
      .activePath("/products")
      .appendDataToResBody({
        productsData,
        categories,
        name: req.session.admin.name,
      })
      .render();
  } catch (error) {
    next(error);
  }
};

exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { findCategoriesForAdminId } = Product;
    const renderer = new Renderer(res);
    const adminId = returnAdminIdIfAdminIsInSession(req);

    const validationErrors = validationResults(req);
    if (validationErrors) {
      return new Flash(req, res)
        .appendError(validationErrors)
        .redirect(`/admin/products?page=1`);
    }
    let { page } = req.query;
    const category = req.params.category;
    page = +page || 1;
    const productsData = await Product.findCategoryProductsForAdminIdAndPage(
      adminId,
      category,
      page
    );
    const categories = await findCategoriesForAdminId(adminId);
    renderer
      .templatePath("admin/products")
      .pageTitle(`${category}`)
      .activePath("/admin/products")
      .pathToPost("/products")
      .appendDataToResBody({
        productsData,
        categories,
        name: req.session.admin.name,
      })
      .render();
  } catch (error) {
    next(error);
  }
};

async function UploadToCloudAndDeleteFile(path) {
  const uploadResult = await cloudUploader.uploads(path);
  await deleteFile(resolvePath(path));
  return uploadResult;
}

exports.deleteProduct = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const adminId = returnAdminIdIfAdminIsInSession(req);
    const prodId = req.params.id;

    const prod = await Product.findById(prodId);
    if (!prod || !prod.isCreatedByAdminId(adminId)) {
      return flash
        .appendError("You can't delete this product")
        .redirect("/admin/products");
    }
    await prod.customDelete();
    res.status(200).send("success");
  } catch (error) {
    next(error);
  }
};

exports.getAdminSales = async (req, res, next) => {
  try {
    const renderer = new Renderer(res);
    const adminId = returnAdminIdIfAdminIsInSession(req);
    const salesData = await AdminSales.findOneForAdminIdAndPopulateProductsData(
      adminId
    );
    renderer
      .templatePath("admin/sales")
      .pageTitle("Your Sales")
      .activePath("/sales")
      .appendDataToResBody({
        salesData,
      })
      .render();
  } catch (error) {
    next(error);
  }
};
