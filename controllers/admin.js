require("dotenv").config();

const imageDeleter = require("../util/deletefile");

const Product = require("../database/interfaces/productForAdmin");
const AdminSale=require('../database/interfaces/adminSalesForAdmin')

const errorHandler = require("../util/errorHandler");
const validationErrorsIn = require("../util/validationResults");

exports.getAddProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: message,
    hasErrors: false
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const title = req.body.title;
    let image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const validationErrors = validationErrorsIn(req);

    const previousData = {
      title,
      image,
      price,
      description,
      quantity
    };

    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    if (!req.file) {
      return renderPageWithError("Please select an image for your pruduct");
    }
    const productData = {
      title,
      imagePath: image.path,
      price,
      description,
      quantity,
      adminId: req.session.admin._id,
      adminName: req.session.admin.name
    };
    await Product.createNew(productData);
    res.redirect("/admin/products");
    const renderPageWithError = errorMessage => {
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasErrors: true,
        previousData: previousData,
        errorMessage: errorMessage
      });
    };
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const editMode = req.query.edit;
    const prodId = req.params.productId;

    const product = await Product.findById(prodId);

    const renderEditPage = message => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasErrors: false,
        errorMessage: message
      });
    };
    if (!product || !product.isCreatedByAdminId(adminId)) {
      return renderEditPage(
        "The product does not exists or you are not authorised to modify the product"
      );
    }
    renderEditPage(
      "To change product image,select one using choose file.leave it empty otherwise "
    );
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    let ImageUrl;
    const updatedDesc = req.body.description;
    const updatedquantity = req.body.quantity;

    const previousData = {
      id: prodId,
      title: updatedTitle,
      price: updatedPrice,
      description: updatedDesc,
      quantity: updatedquantity
    };

    const renderPageWithError = errorMessage => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        product: previousData,
        errorMessage: errorMessage
      });
    };
    const validationErrors = validationErrorsIn(req);

    const product = await Product.findById(prodId);
    if (!product || !product.isCreatedByAdminId(adminId)) {
      return renderPageWithError(
        "The product does not exist or you are not authorized to modify this product"
      );
    }

    if (!req.file) {
      ImageUrl = product.ImageUrl;
    }

    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }

    //to avoid race condition, delete current product image before updating the product
    if (req.file) {
      ImageUrl = req.file.path;
      imageDeleter(product.ImageUrl);
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.ImageUrl = ImageUrl;
    product.description = updatedDesc;
    product.quantity = updatedquantity;
    product.adminId = req.session.admin._id;
    product.adminName = req.session.admin.name;
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const currentAdminId = req.session.admin._id;
    const page = +req.query.page || 1;
    const { paginationData, products } = await Product.findPageProductsForAdminId(
      currentAdminId,
      page
    );
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      hasErrors: false,
      paginationData: paginationData
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const prodId = req.body.productId;
    const prod = await Product.findById(prodId);
    if (!prod || !prod.isCreatedByAdminId(adminId)) {
      res.flash("error", "You can't delete this product");
      return res.redirect("/admin/products");
    }

    imageDeleter(prod.ImageUrl);
    /*to avoid race condition first delete the image 
    using the product's image url and then delete the product data
    */

    await Product.deleteById(prodId);
    res.redirect("/admin/products");
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getAdminSales = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const fromTime = Date.now() - 1000 * 60;
    const toTime = Date.now();
    if (fromTime > Date.now() || toTime > Date.now()) {
      return res.redirect("/products");
    }
     const salesToDisplay=await AdminSale.getSalesForAdminIdWithinAnInterval(adminId,fromTime,toTime);
    console.log(salesToDisplay)
    res.redirect("/products");
  } catch (error) {
    errorHandler(error, next);
  }
};
