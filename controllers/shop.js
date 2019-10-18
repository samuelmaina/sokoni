const Product = require("../models/product");
const Order = require("../models/order");
const path=require('path');
const fs=require('fs');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log('the session user is '+req.session.user);
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
  Product.findById({_id: prodId }).then(product => {
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products"
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
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
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart", 
        pageTitle: "Your Cart",
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
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
      const prods=user.cart.items.map(i=>{
       return {
        quantity:i.quantity,product:{...i.productId._doc}
       } 
      })
      console.log(prods);
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products:prods
      });
      order.save()
      return user.clearCart();
    })
    .then(result => res.redirect("/orders"))
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId':req.user.id})
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoice=(req,res,next)=>{
  const order=req.params.orderId;
  const InvoicePath=path.join('data','invoices','Kreutzer R. Understanding Artificial Intelligence. Fundamentals, Use Cases and Methods...2019.pdf');
//  data is streamed
  const file=fs.createReadStream(InvoicePath);
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment;filename=samuel.pdf');
    file.pipe(res);
  };
