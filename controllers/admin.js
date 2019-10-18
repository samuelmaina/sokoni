const Product = require("../models/product");

// function to delete a product image when deleting a product  in the database or when updating the product.
const filedeleter = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
   
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  let image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    image = "good person";
  } else {
    image = image.path;
  }
  const product = new Product({
    title: title,
    ImageUrl: image,
    price: price,
    description: description
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
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  let image = req.file;
  const updatedDesc = req.body.description;
  console.log(image);
  if (!image) {
    image = "good person";
  } else {
    image = image.path;
  }

  Product.findById({ _id: prodId })
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      // delete current product image before updating the product
      filedeleter.deletefile(product.ImageUrl);
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.ImageUrl = image;
      product.description = updatedDesc;
      product.save();
    })
    .catch(err => console.log(err));
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(prod => {
      filedeleter.deletefile(prod.ImageUrl);
      // added the function there to avoid a race condition between fetching of product and its deletion
      // .we search for the  product,delete its image and then delete the product
      Product.remove({ _id: prodId }).catch(err => console.log(err));
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
