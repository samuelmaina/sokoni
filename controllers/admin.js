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
    const buyingPrice=req.body.buyingPrice;
    const percentageProfit=req.body.percentageProfit;
    const expirationPeriod=req.body.expirationPeriod;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const validationErrors = validationErrorsIn(req);

    const previousData = {
      title,
      image,
      buyingPrice,
      percentageProfit,
      expirationPeriod,
      description,
      quantity
    };
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

    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    if (!req.file) {
      return renderPageWithError("Please select an image for your product");
    }
    const productData = {
      title,
      imageUrl: image.path,
      buyingPrice,
      percentageProfit,
      expirationPeriod,
      description,
      quantity,
      adminId: req.session.admin._id,
      adminName: req.session.admin.name
    };
    await Product.createNew(productData);
    res.redirect("/admin/products");
   
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
      "To change product image,select one using choose file.Leave it empty otherwise "
    )
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const adminId = req.session.admin._id;
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const imageFile=req.file
    const updatedBuyingPrice=req.body.buyingPrice;
    const updatedPercentageProfit=req.body.percentageProfit;
    const updatedExpirationPeriod=req.body.expirationPeriod;
    const updatedDesc = req.body.description;
    const updatedQuantity = req.body.quantity;

    const previousData = {
      id: prodId,
      title: updatedTitle,
      buyingPrice:updatedBuyingPrice,
      percentageProfit:updatedPercentageProfit,
      expirationPeriod:updatedExpirationPeriod,
      description: updatedDesc,
      quantity: updatedQuantity
    };
  

    const renderPageWithError = errorMessage => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasErrors:false,
        product: previousData,
        errorMessage: errorMessage
      });
    };
    const validationErrors = validationErrorsIn(req);
     if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    const product = await Product.findById(prodId);
    if (!product || !product.isCreatedByAdminId(adminId)) {
      return renderPageWithError(
        "The product does not exist or you are not authorized to modify this product"
      );
    }
    const productUpdateDetails={
      imageFile:imageFile,
      title:updatedTitle,
      buyingPrice:updatedBuyingPrice,
      percentageProfit:updatedPercentageProfit,
      expirationPeriod:updatedExpirationPeriod,
      description:updatedDesc,
      quantity:updatedQuantity
    }
    product.updateDetails(productUpdateDetails)
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
    imageDeleter(prod.imageUrl);
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
    const fromTime = Date.now() - 1000 * 60*60*24;
    const toTime = Date.now();
    if (fromTime > Date.now() || toTime > Date.now()) {
      return res.redirect("/products");
    }
    console.log(adminId)
     const salesProfits= await   AdminSale.modifyWithinAnIntervalForAdminId(adminId,fromTime,toTime);
     console.log(salesProfits);
    res.redirect('products');
  } catch (error) {
    errorHandler(error, next);
  }
};
