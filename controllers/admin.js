const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
require("dotenv").config();




// function to delete a product image when deleting a product  in the database or when updating the product.
const filedeleter = require("../util/deletefile");

const Product = require("../models/product");
const Admin = require("../models/admin");



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // also remember to turn on third party intervention in the account setting https://www.youtube.com/redirect?q=https%3A%2F%2Fmyaccount.google.com%2Flesssecureapps&v=NB71vyCj2X4&event=video_description&redir_token=sZ5_aOhjQQJNBvg3NBb4VZRn0nN8MTU3MzI0MDg0MkAxNTczMTU0NDQy
    user: "samuelmainaonlineshop@gmail.com",
    pass: process.env.GOOGLE_PASSWORD
  }
});

exports.getAdminSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/signup", {
    pageTitle: "Administrator Sign In",
    path: "/admin/signup",
    errorMessage: message
  });
};

exports.postAdminSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/signup", {
      pageTitle: "Administrator Sign In",
      path: "/admin/signup",
      errorMessage: errors.array()[0].msg
    });
  }
  bcrypt.hash(password, 12, (err, result) => {
    if (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    const newAdmin = new Admin({
      adminName: name,
      adminEmail: email,
      password: result
    });

    newAdmin
      .save()
      .then(result => {
        res.redirect("/admin/login");
        return transporter
          .sendMail({
            from: "samuelawesomeshop@online.com",
            to: result.adminEmail,
            subject: "Admin Sign Up successful",
            html: `<strong> Dear ${name} ,<br> You have successfully signed in as an admin.Login to do the following: </strong><br><p>add products<br><p>edit products</p><br><p>And do much more as an admin</p>`
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/login", {
    pageTitle: "Administrator Login",
    path: "/auth/login",
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/login", {
      pageTitle: "Administrator Login",
      path: "/auth/login",
      errorMessage: errors.array()[0].msg
    });
  }
  Admin.findOne({ adminEmail: email })
    .then(admin => {
      if (!admin) {
        req.flash("error", "Incorrect email");
        return res.redirect("/admin/login");
      }
      bcrypt
        .compare(password, admin.password)
        .then(isPwdValid => {
          if (isPwdValid) {
            req.session.isAdmin = true;
            req.session.admin = admin;
            return req.session.save(err => {
              if (err) {
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
              } else {
                res.redirect("/admin/products");
              }
            });
          } else {
            req.flash("error", "Incorrect password");
            return res.redirect("/admin/login");
          }
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    res.redirect("/");
  });
};

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
    errorMessage: message
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  let image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const quantity = req.body.quantity;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg
    });
  }
  if (!req.file) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: "Please select an image for your pruduct"
    });
  }

  const product = new Product({
    title: title,
    ImageUrl: image.path,
    price: price,
    description: description,
    quantity: quantity,
    adminId: req.session.admin._id,
    adminName: req.session.admin.adminName
  });
  product
    .save()
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  Product.findById({ _id: prodId })
    .then(product => {
      if (
        !product ||
        product.adminId.toString() !== req.session.admin._id.toString()
      ) {
        return res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: editMode,
          product: product,
          errorMessage:
            "The product does not exists or you are not authorised to modify the product"
        });
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        errorMessage: ""
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  let image = req.file;
  const updatedDesc = req.body.description;
  const updatedquantity = req.body.quantity;
  const errors = validationResult(req);
  Product.findOne({ _id: prodId })
    .then(product => {
      if (
        !product ||
        product.adminId.toString() !== req.session.admin._id.toString()
      ) {
        return res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: true,
          product: product,
          errorMessage:
            "The product does not exist or you are not authorized to modify this product"
        });
      }

      if (!req.file) {
        return res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: true,
          product: product,
          errorMessage: "Please select an image to update for this product"
        });
      }

      if (!errors.isEmpty()) {
        return res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: true,
          product: product,
          errorMessage: errors.array()[0].msg
        });
      }

      // delete current product image before updating the product
      filedeleter.deletefile(product.ImageUrl);
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.ImageUrl = image.path;
      product.description = updatedDesc;
      product.quantity = updatedquantity;
      product.adminId = req.session.admin._id;
      product.adminName = req.session.admin.adminName;
      product
        .save()
        .then(result => {
          res.redirect("/admin/products");
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ adminId: req.session.admin._id })
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(prod => {
      if (
        !prod ||
        prod.adminId.toString() !== req.session.admin._id.toString()
      ) {
        return res.redirect("/admin/products");
      }
      filedeleter.deletefile(prod.ImageUrl);
      // added the function there to avoid a race condition between fetching of product and its deletion
      // .we search for the  product,delete its image and then delete the product
      Product.deleteOne({ _id: prodId }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
