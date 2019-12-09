const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
require("dotenv").config();




const imageDeleter= require("../util/deletefile");

const Product = require("../models/product");
const Admin = require("../models/admin");

const errorHandler=require('../util/errorHandler');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // remember to turn on third party intervention in the account setting https://www.youtube.com/redirect?q=https%3A%2F%2Fmyaccount.google.com%2Flesssecureapps&v=NB71vyCj2X4&event=video_description&redir_token=sZ5_aOhjQQJNBvg3NBb4VZRn0nN8MTU3MzI0MDg0MkAxNTczMTU0NDQy
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
  res.render("auth/signup",{
    pageTitle: "Administrator Sign In",
    path: "/admin/signup",
    postPath: "admin/signup",
    errorMessage: message
  });
};



exports.postAdminSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/signup", {
      pageTitle: "Administrator Sign In",
      path: "/admin/signup",
       postPath: '/admin/signup',
      errorMessage: errors.array()[0].msg
    });
  }
  bcrypt.hash(password, 12).then(result=>{
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
          .catch(err => errorHandler(err, next));
      })
      .catch(err => errorHandler(err, next));
  }) .catch(err=>{
    errorHandler(err,next)
  }) 
};



exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Administrator Login",
    path: "/auth/login",
    postPath: "admin/login",
    errorMessage: message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      pageTitle: "Administrator Login",
      path: "/auth/login",
      postPath: "auth/login",
      errorMessage: errors.array()[0].msg
    });
  }
  Admin.findOne({ adminEmail: email })
    .then(admin => {
      if (!admin) {
        req.flash("error", "Incorrect email or password");
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
               errorHandler(err,next)
              }
                res.redirect("/admin/products");
              }
            );
          } else {
            req.flash("error", "Incorrect email or password");
            return res.redirect("/admin/login");
          }
        })
        .catch(err => errorHandler(err, next));
    })
    .catch(err => errorHandler(err, next));
};
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetPassword", {
    pageTitle: "Reset Password",
    path: "/admin/resetPassword",
    editing: false,
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      errorHandler(err, next);
    }
    const token = buffer.toString("hex");
    Admin.findOne({ email: req.body.email })
      .then(admin => {
        if (!admin) {
          return res.render("auth/resetPassword", {
            pageTitle: "Reset Password",
            path: "reset",
            errorMessage: "No admin by that email exists"
          });
        }
        admin.resetToken = token;
        admin.tokenExpiration = Date.now() + 60 * 60 * 1000;
        admin
          .save()
          .then(saved => {
            transporter
              .sendMail({
                from: "samuelsonlineshop@online.com",
                to: admin.email,
                subject: "Reset Password",
                html: `<strong> Dear ${admin.name}</strong>,
             <br><p>You can click this link to reset your Administrator's password : <a href='http://localhost:3000/admin/reset/${token}'>
             Reset password</a></p>
             <p>Please note your have only one hour to reset your password</p>
            <br> Thank you `
              })
              .then(result => {
                let message = `Dear ${admin.name},
            A link has been sent to your email.Please click the link to reset your password`;
                return res.render("userFeedback", {
                  pageTitle: "Message",
                  path: "userMessage",
                  isAuthenticated: req.session.isLoggedIn,
                  isAdmin: req.session.isAdmin,
                  userMessage: message
                });
              });
          })
          .catch(err => errorHandler(err, next));
      })
      .catch(err => errorHandler(err, next));
  });
};


exports.getNewPassword = (req, res, next) => {
  Order.findOne({
    resetToken: req.params.token,
    tokenExpiration: { $gt: Date.now() }
  })
    .then(resetUser => {
      if (!resetUser) {
        return res.render("auth/resetPassword", {
          pageTitle: "Reset Password",
          path: "reset",
          postPath: "/newPassword",
          errorMessage: "Too late for the rest. Please try again"
        });
      }

      resetUser.tokenExpiration = undefined;

      resetUser
        .save()
        .then(result => {
          res.render("auth/newPassword", {
            pageTitle: "New Password",
            path: "new password",
            postPath: "/newPassword",
            errorMessage: "",
            userId: resetUser.id,
            token: resetUser.resetToken
          });
        })
        .catch(err => errorHandler(err, next));
    })
    .catch(err => errorHandler(err, next));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  User.findOne({ resetToken: token, _id: userId })
    .then(user => {
      if (!user) {
        return res.render("auth/newPassword", {
          pageTitle: "New Password",
          path: "new password",
          postPath: "/newPassword",
          errorMessage: "You are not authorized to modify the password"
        });
      }

      bcrypt.hash(newPassword, 12, (err, result) => {
        if (err) {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        }
        user.resetToken = undefined;
        user.password = result;
        user
          .save()
          .then(savedUser => {
            res.redirect("/login");
          })
          .catch(err => errorHandler(err, next));
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
     errorHandler(err,next)
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
  const price = req.body.price
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
    .catch(err => errorHandler(err, next));
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
        errorMessage: "To change product image,select one using choose file.leave it empty otherwise "
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  let ImageUrl;
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
        ImageUrl = product.ImageUrl;
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

      //to avoid race condition, delete current product image before updating the product
      if(req.file){
          ImageUrl = req.file.path;
           imageDeleter(product.ImageUrl);
      }
    
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.ImageUrl = ImageUrl;
      product.description = updatedDesc;
      product.quantity = updatedquantity;
      product.adminId = req.session.admin._id;
      product.adminName = req.session.admin.adminName;
      product
        .save()
        .then(result => {
          res.redirect("/admin/products");
        })
        .catch(err => errorHandler(err, next));
    })
    .catch(err => errorHandler(err,next));
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
   .catch(err => errorHandler(err,next));
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
      imageDeleter(prod.ImageUrl);
    //to avoid race condition first delete the image using the product's image url and then delete the product data
      Product.deleteOne({ _id: prodId }).then(done=>{
        res.redirect("/admin/products");
      }).catch(err => errorHandler(err,next));
     
    })
    .catch(err => errorHandler(err,next));
};


