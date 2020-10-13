const path = require("path");

require("dotenv").config();

const {deleteFile, validationResults, Renderer, Flash} = require("../util");

const {ProductForAdmin, AdminSalesForAdmin} = require("../database/interfaces");

exports.getAddProduct = (req, res, next) => {
  new Renderer(res)
    .templatePath("admin/edit-product")
    .pageTitle("Add Product")
    .pathToPost("/admin/add-product")
    .activePath("/add-product")
    .options({editing: false})
    .render();
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const flash = new Flash(req, res).appendPreviousData(req.body);
    let image = req.file;
    const validationErrors = validationResults(req);

    if (!image) {
      return flash
        .appendError("Please select an image for your product")
        .redirect("add-product");
    }
    if (validationErrors) {
      return flash.appendError(validationErrors).redirect("add-product");
    }

    const productData = req.body;
    productData.imageUrl = image.path;
    productData.adminId = req.session.admin._id;
    await ProductForAdmin.createNew(productData);
    flash
      .appendInfo("ProductForAdmin successfully created")
      .redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const adminId = req.session.admin._id;
    const {edit, page} = req.query;

    const prodId = req.params.id;
    const product = await ProductForAdmin.findById(prodId);

    if (!product || !product.isCreatedByAdminId(adminId)) {
      return flash
        .appendError("Product not there or you are not authorised to modify it")
        .redirect("/admin/products");
    }
    new Renderer(res)
      .templatePath("admin/edit-product")
      .pageTitle("Edit Product")
      .pathToPost("/admin/edit-product")
      .activePath("/products")
      .appendPreviousData(product)
      .options({
        editing: edit,
        page,
      })
      .render();
  } catch (error) {
    next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const {page, id} = req.body;
    const editMode = true;
    let image = req.file;

    const renderer = new Renderer(res)
      .templatePath("admin/edit-product")
      .pageTitle("Edit Product")
      .pathToPost("/admin/edit-product")
      .activePath("/products")
      .appendPreviousData(req.body)
      .options({
        editing: editMode,
        page,
      });
    const productData = req.body;

    const adminId = req.session.admin._id;
    if (image) {
      productData.imageUrl = image.path;
    }
    const validationErrors = validationResults(req);
    if (validationErrors) {
      return renderer.appendError(validationErrors).render();
    }
    const product = await ProductForAdmin.findById(id);
    if (!product || !product.isCreatedByAdminId(adminId)) {
      return renderer
        .appendError(
          "Product is not there or you are not not allowed to modify it"
        )
        .render();
    }

    await product.updateDetails(productData);

    new Flash(req, res)
      .appendInfo("Product updated successfully")
      .redirect(`/admin/products?page=${page}`);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const renderer = new Renderer(res);
    const currentAdminId = req.session.admin._id;
    const page = +req.query.page || 1;
    const {
      paginationData,
      products,
    } = await ProductForAdmin.findPageProductsForAdminId(currentAdminId, page);
    renderer
      .templatePath("admin/products")
      .pageTitle("Admin Products")
      .activePath("/admin/products")
      .activePath("/products")
      .options({
        prods: products,
        paginationData,
      })
      .render();
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const adminId = req.session.admin._id;
    const prodId = req.params.id;
    const prod = await ProductForAdmin.findById(prodId);
    if (!prod || !prod.isCreatedByAdminId(adminId)) {
      return flash
        .appendError("You can't delete this product")
        .redirect("/admin/products");
    }
    deleteFile(path.resolve(prod.imageUrl));
    /*to avoid race condition first delete the image 
    using the product's image url and then delete the product data
    */

    await ProductForAdmin.deleteById(prodId);
    flash
      .appendInfo("Product deleted successfully")
      .redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

exports.getAdminSales = async (req, res, next) => {
  try {
    const renderer = new Renderer(res);
    const adminId = req.session.admin._id;
    const errorMessage = "";

    //the following fromTime and toTime is just used for testing purposes
    // their values are supposed to be picked on the front end preferably
    // from a date selector.
    const fromTime = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const toTime = Date.now();
    if (fromTime > Date.now() || toTime > Date.now()) {
      return res.redirect("/products");
    }
    const salesProfits = await AdminSalesForAdmin.salesWithinAnIntervalForAdminId(
      adminId,
      fromTime,
      toTime
    );

    renderer
      .templatePath("admin/sales")
      .pageTitle("Your Sales")
      .activePath("/sales")
      .options({
        sales: salesProfits,
      })
      .render();
  } catch (error) {
    next(error);
  }
};
