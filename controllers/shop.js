const Product = require("../models/product");
const Order = require("../models/order");
const path = require("path");
const fs = require("fs");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      //ejs view will dispay 'no product' incase products is null.no need to check if null
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById({ _id: prodId }).then(product => {
    if (!product) {
      res.redirect("/");
    }
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/product"
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      //ejs view will dispay 'no product' incase products is null.no need to check if null
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId ")
    .execPopulate()
    .then(user => {
      //same as for products .no need for if null,ejs will display 'no products in cart'
      const products = user.cart.items;
      //  get the total price of all the products in the cart
      let total = 0.0;
      products.forEach(product => {
        total += product.quantity * product.productId.price;
      });
      req.session.total = total;
      req.session.cartProducts = products;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        total: total
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if (product) {
        return req.user.addToCart(product);
      }
    })
    .then(result => {
      res.redirect("/products");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, productId: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products,
        total: req.session.total
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user.id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
n};

exports.getInvoice = (req, res, next) => {
  const order = req.params.orderId;
  const InvoicePath = path.join("data", "invoices", "file.pdf");

  //  data is streamed
  const file = fs.createReadStream(InvoicePath);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment;filename=samuel.pdf");
  file.pipe(res);
};
