const Product = require("../models/product");
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

// function to delete a product image when deleting a product  in the database or when updating the product.
const filedeleter = require("../util/file");

exports.getAdminSignUp = (req, res, next) => {
  res.render("admin/signup", {
    pageTitle: "Administrator Sign In",
    path: "/admin/signup"
  });
};

exports.postAdminSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const ConfirmPassword = req.body.ConfirmPassword;
  Admin.findOne({ email: email })
    .then(admin => {
      if (admin || password !== ConfirmPassword) {
        return res.redirect("/admin/signup");
      }

      bcrypt.hash(password, 12, (err, result) => {
        if (err) {
          console.log(err);
        }
        const newAdmin = new Admin({
          adminName: name,
          adminEmail: email,
          password: result
        });

        newAdmin
          .save()
          .then(result => res.redirect("/admin/login"))
          .catch(err => console.log(err));
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getLogin = (req, res, next) => {
  res.render("admin/login", {
    pageTitle: "Administrator Login",
    path: "/auth/login"
  });
};

exports.postLogin = (req, res, next) => {
  console.log("reached the post login route");
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({ adminEmail: email })
    .then(admin => {
      if (!admin) {
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
                console.log(err);
              } else {
                res.redirect("/admin/products");
              }
            });
          } else {
            return res.redirect("/admin/login");
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    console.log("Deleted the current active session");
    res.redirect("/");
  });
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  let image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const quantity = req.body.quantity;

  if (!image) {
    image = "good person";
  } else {
    image = image.path;
  }
  const product = new Product({
    title: title,
    ImageUrl: image,
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
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById({ _id: prodId }).then(product => {
    if (
      !product ||
      product.adminId.toString() !== req.session.admin._id.toString()
    ) {
      return res.redirect("/admin/products");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  let image = req.file;
  const updatedDesc = req.body.description;
  const updatedquantity = req.body.quantity;
  console.log(image);
  if (!image) {
    image = "good person";
  } else {
    image = image.path;
  }
  Product.findById({ _id: prodId })
    .then(product => {
      if (
        !product ||
        product.adminId.toString() !== req.session.admin._id.toString()
      ) {
        return res.redirect("/admin/edit-product");
      }
      // delete current product image before updating the product
      filedeleter.deletefile(product.ImageUrl);
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.ImageUrl = image;
      product.description = updatedDesc;
      product.quantity = updatedquantity;
      product.adminId = req.session.admin._id;
      product.adminName = req.session.admin.adminName;
      product.save();
    })
    .catch(err => console.log(err));
  res.redirect("/admin/products");
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
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(prod => {
      if (!prod || prod.adminId.toString()!== req.session.admin._id.toString()) {
        return res.redirect("/admin/products");
      }
      filedeleter.deletefile(prod.ImageUrl);
      // added the function there to avoid a race condition between fetching of product and its deletion
      // .we search for the  product,delete its image and then delete the product
      Product.deleteOne({ _id: prodId }).catch(err => console.log(err));
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
