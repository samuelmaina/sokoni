const path = require("path");
const fs = require("fs");

const generateInvoicePdf = require("../util/invoicePdfGenerator");

const Order = require("../database/interfaces/orderForShop");
const AdminSale = require("../database/interfaces/adminSaleForShop");
const User = require("../database/interfaces/userForShop");
const Product = require("../database/interfaces/productForShop");

const errorHandler = require("../util/errorHandler");

exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const { paginationData, products } = await Product.findProductsForPage(
      page
    );
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      paginationData: paginationData
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getProducts = async (req, res, next) => {

  try {
    const page = +req.query.page || 1;
    const { paginationData, products } = await Product.findProductsForPage(
      page
    );
    // res.status(200).json({
    //   paginationData: paginationData,
    //   prods: products
    // });
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      paginationData: paginationData
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/product"
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const {
      total,
      cartProducts
    } = await User.findCartProductsAndTheirTotalsForUserId(req.user._id);
    req.session.total = total;
    req.session.orderedProducts = cartProducts;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: cartProducts,
      total: total
    });
  } catch (error) {
    errorHandler(error, next);
    console.log(error);
  }
};

exports.postToCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product =await  Product.findById(prodId);
    if (product) {
       req.user.addProductIdToCart(prodId);
       await product.reduceQuantityByOne();
    }
    res.redirect("/products");
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const deletedQuantity = await req.user.deleteProductIdFromCart(prodId);
    res.redirect("/cart");
    const product= await Product.findById(prodId);
    await product.increaseQuantityBy(deletedQuantity);
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAllForUserId(req.user._id);
    console.log(orders);
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const orderedProducts = req.session.orderedProducts;
    const productTotal = req.session.total;
    const orderData = {
      userId: req.user._id,
      orderedProducts: orderedProducts,
      totalPriceOfOrderedProducts: productTotal
    };
    await Order.createNew(orderData);
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (error) {
    console.log(error);
    errorHandler(error, next);
  }
};

exports.createInvoicePdf = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("Data", "Invoices", invoiceName);
    const order = await Order.findByIdWithDetails(orderId);
    if (!order) {
      throw new Error("Order does not exist");
    }
    if (!order.isOrderedById(req.user._id)) {
      throw new Error("You are not authorized to operate on this order");
    }
    //to be used by the next middleware
    req.invoiceName = invoiceName;
    req.invoicePath = invoicePath;
    req.orderedProducts = order.orderedProducts;
    await generateInvoicePdf(order, invoicePath,req.user.name);
    await Order.deleteById(orderId);
    return next();
  } catch (error) {
    errorHandler(error, next);
  }
};

const addToAdminSales = async (orderedProducts, next) => {
  try {
    for (const product of orderedProducts) {
      const productDetails = product.productData;
      let adminSales = await AdminSale.findSalesForAdminId(productDetails.adminId);
      if (!adminSales) {
        adminSales = await AdminSale.createNew(productDetails.adminId);
      }
      const saleDetails = {
        quantity: product.quantity,
        productId: productDetails._id,
        soldAt: Date.now()
      };
       adminSales.addOrderedProduct(saleDetails);
    }
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getInvoice = async (req, res, next) => {
  const invoiceName = req.invoiceName;
  const invoicePath = req.invoicePath;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="' + invoiceName + '"'
  );
  const file = fs.createReadStream(invoicePath);
  file.pipe(res);
  addToAdminSales(req.orderedProducts, next);
};
