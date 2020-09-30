const path = require("path");

const pipeInvoicePdf = require("../util/invoicePdfGenerator");

const Order = require("../database/interfaces/orderForShop");
const AdminSale = require("../database/interfaces/adminSaleForShop");
const User = require("../database/interfaces/userForShop");
const Product = require("../database/interfaces/productForShop");

const errorHandler = require("../util/errorHandler");
exports.getProductPerCategory = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const category = req.params.category;
    const categories = await Product.Model.getPresentCategories();
    const {
      paginationData,
      products,
    } = await Product.Model.findCategoryProducts(category, page);
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      paginationData,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const categories = await Product.Model.getPresentCategories();
    const page = req.query.page || 1;
    const { paginationData, products } = await Product.findProductsForPage(
      page
    );
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      paginationData,
      categories,
    });
  } catch (error) {
    next(error);
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
      paginationData: paginationData,
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const page = +req.query.page || 1;
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }
    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: "/product",
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};
const addToCartPage = async (req, res, product, previousData, error, info) => {
  const { page } = req.body;
  if (product) {
    res.render("shop/add-to-cart", {
      pageTitle: "Add product",
      path: "/add/to-cart",
      product,
      page,
      error,
      previousData,
      info,
    });
  }
};

exports.getAddToCart = async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  return addToCartPage(
    req,
    res,
    product,
    req.body,
    "",
    "Thank you for adding it"
  );
};
exports.postToCart = async (req, res, next) => {
  try {
    let { page, quantity, productId } = req.body;
    const previousData = req.body;
    let errorMessage, info;
    const product = await Product.findById(productId);
    if (quantity < 1) {
      errorMessage = "add 1 or more products as quantity";
      return addToCartPage(req, res, product, previousData, errorMessage, "");
    }
    if (product) {
      const total = product.sellingPrice * quantity;
      const currentBalance = req.user.getCurrentBalance();
      if (!(currentBalance >= total)) {
        info = `Dear customer you don't have enough balance to complete
         this transaction. Please reduce your quantity or  recharge Kshs ${(
           total - currentBalance
         ).toFixed(2)} in your account and try again.`;
        return addToCartPage(req, res, product, previousData, "", info);
      } else {
        await req.user.reduceBalance(total);
      }

      const currentQuantity = product.getQuantity();
      if (currentQuantity < quantity) {
        info = `On stock quantity is ${currentQuantity}.Please request less quantity`;
        return addToCartPage(req, res, product, previousData, "", info);
      }
      await req.user.addProductIdToCart(productId, quantity);
      await product.reduceQuantityBy(quantity);
    }
    // res.status(200).json({
    //   paginationData: paginationData,
    //   prods: products
    // });
    req.flash("info", "Product successfully added to the cart");
    res.redirect(`products?page=${page}`);
  } catch (error) {
    next(error);
  }
};
exports.getCart = async (req, res, next) => {
  try {
    const {
      cartProducts,
      total,
    } = await User.findCartProductsAndTheirTotalsForUserId(req.user._id);
    req.session.total = total;
    req.session.orderedProducts = cartProducts;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: cartProducts,
      total,
    });
  } catch (error) {
    next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const deletedQuantity = await req.user.deleteProductIdFromCart(prodId);
    res.redirect("/cart");
    const product = await Product.findById(prodId);
    //increase the quantity earlier deleted since the product(s) were rejected
    await product.increaseQuantityBy(deletedQuantity);
    // refund the customer
    await req.user.incrementAccountBalance(
      deletedQuantity * product.sellingPrice
    );
  } catch (error) {
    next(error);
  }
};
exports.createOrder = async (req, res, next) => {
  try {
    const orderedProducts = req.session.orderedProducts;
    const productTotal = req.session.total;
    const userId = req.user._id;
    const orderData = {
      userId: userId,
      orderedProducts: orderedProducts,
      total: productTotal,
    };
    const order = await Order.createNew(orderData);
    await req.user.clearCart();
    res.redirect("/orders");
    const populatedOrder = await Order.findByIdWithDetails(order._id);
    await addToAdminSales(populatedOrder.orderedProducts, next);
  } catch (error) {
    next(error);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAllForUserId(req.user._id);
    if (orders)
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        errorMessage: "",
      });
  } catch (error) {
    next(error);
  }
};

exports.createInvoicePdf = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("Data", "Invoices", invoiceName);
    const order = await Order.findByIdWithDetails(orderId);
    if (!order) {
      req.flash("error", "No such order exists");
      return res.redirect("/orders");
    }
    if (!order.isOrderedById(req.user._id)) {
      throw new Error("You are not authorized to operate on this order");
    }
    pipeInvoicePdf(order, invoicePath, res);
  } catch (error) {
    next(error);
  }
};

const addToAdminSales = async (orderedProducts, next) => {
  try {
    for (const product of orderedProducts) {
      const productDetails = product.productData;
      let adminSales = await AdminSale.findSalesForAdminId(
        productDetails.adminId
      );

      if (!adminSales) {
        adminSales = await AdminSale.createNew(productDetails.adminId);
      }
      const saleDetails = {
        quantity: product.quantity,
        productId: productDetails._id,
        soldAt: Date.now(),
      };
      await adminSales.addOrderedProduct(saleDetails);
    }
  } catch (error) {
    next(error);
  }
};
