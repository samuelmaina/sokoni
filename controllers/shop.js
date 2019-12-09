const path = require("path");
const fs = require("fs");
const pdfGenerator = require("../util/pdfGenerator");

const Admin=require('../models/admin');
const Product = require("../models/product");
const Order = require("../models/order");

const errorHandler = require("../util/errorHandler");

exports.getIndex = (req, res, next) => {
  Product.find({ quantity: { $gt: 0 } })
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.getProducts = (req, res, next) => {
  Product.find({quantity:{ $gt:0}})
    .then(products => {
      //ejs view will dispay 'no product' incase products is null.no need to check if null
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products"
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById({ _id: prodId })
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/product"
      });
    })
    .catch(err => errorHandler(err, next));
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

      total = total.toFixed(2);
      req.session.total = total;
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
        req.user.addToCart(product);
        product.reduceQuantity();
      }
    })
    .then(result => {
      res.redirect("/products");
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
   const deletedCartQuantity=req.user
    .deleteItemFromCart(prodId);

      res.redirect("/cart");
      Product.findById(prodId)
        .then(productToUpdateQuantity => {
          productToUpdateQuantity.increaseQuantity(deletedCartQuantity);
        })
        .catch(err => {
          console.log(err);
        }); //errorHandler(err,next))

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
    .catch(err => errorHandler(err, next));
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
      return order.save().catch(err => errorHandler(err, next));
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => errorHandler(err, next));
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = "invoice-" + orderId+ ".pdf";
  const invoicePath = path.join("Data", "Invoices", invoiceName);
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        throw new Error("Order does not exist");
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        throw new Error("You are not authorized to operate on this order");
      }
      return pdfGenerator(order, invoicePath, req.user.name)
        .then(done => {
          if (done) {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
              "Content-Disposition",
              'inline; filename="' + invoiceName + '"'
            );
            const file = fs.createReadStream(invoicePath);
            file.pipe(res);
          order.products.forEach(product=>{
            Admin.findById(product.productId.adminId).then(admin=>{
              admin.addSoldProduct(product.productId);
            }).catch(err=>errorHandler(err,next))
          })
            return Order.findByIdAndDelete(orderId).catch(err => {
              errorHandler(err, next);
            });
          }
        })
        .catch(err => {
          errorHandler(err, next);
        });
    })
    .catch(err => errorHandler(err, next));
};
