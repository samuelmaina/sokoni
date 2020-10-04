const path = require("path");

require("dotenv").config();

const imageDeleter = require("../util/deletefile");

const Product = require("../database/interfaces/productForAdmin");
const AdminSale = require("../database/interfaces/adminSalesForAdmin");

const validationErrorsIn = require("../util/validationResults");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    let image = req.file;
    const validationErrors = validationErrorsIn(req);
    const previousData = req.body;
    if (validationErrors) {
      req.flash("error", validationErrors);
      req.flash("previous-data", previousData);
      return res.redirect("add-product");
    }
    if (!image) {
      req.flash("error", "Please select an image for your product");
      req.flash("previous-data", previousData);
      return res.redirect("add-product");
    }

    const productData = req.body;
    productData.imageUrl = image.path;
    productData.adminId = req.session.admin._id;
    await Product.createNew(productData);
    req.flash("info", "Product successfully created");
    res.redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const editMode = req.query.edit;
    const prodId = req.params.productId;

    const product = await Product.findById(prodId);
    if (!product || !product.isCreatedByAdminId(adminId)) {
      req.flash(
        "error",
        "Product not there or you are not authorised to modify it"
      );
      return res.redirect("products");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      previousData: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const previousData = req.body;
    let image = req.file;
    const prodId = req.body.productId;
    editMode = true;

    const adminId = req.session.admin._id;
    if (image) {
      productData.imageUrl = image.path;
    }
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        error: validationErrors,
        previousData,
      });
    }
    const product = await Product.findById(prodId);
    if (!product || !product.isCreatedByAdminId(adminId)) {
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        error:
          "The product does not exist or you are not authorized to modify this product",
        previousData,
      });
    }

    await product.updateDetails(productData);
    req.flash("info", "Product updated successfully");
    res.redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const currentAdminId = req.session.admin._id;
    const page = +req.query.page || 1;
    const {
      paginationData,
      products,
    } = await Product.findPageProductsForAdminId(currentAdminId, page);
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      hasErrors: false,
      paginationData: paginationData,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const prodId = req.params.productId;
    const prod = await Product.findById(prodId);
    if (!prod || !prod.isCreatedByAdminId(adminId)) {
      res.flash("error", "You can't delete this product");
      return res.redirect("/admin/products");
    }
    imageDeleter(path.resolve(prod.imageUrl));
    /*to avoid race condition first delete the image 
    using the product's image url and then delete the product data
    */

    await Product.deleteById(prodId);

    res.redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

exports.getAdminSales = async (req, res, next) => {
  try {
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
    const salesProfits = await AdminSale.salesWithinAnIntervalForAdminId(
      adminId,
      fromTime,
      toTime
    );
    res.render("admin/sales", {
      pageTitle: "Your Sales",
      path: "/admin/get-admin-sales",
      errorMessage: errorMessage,
      sales: salesProfits,
    });
  } catch (error) {
    next(error);
  }
};
