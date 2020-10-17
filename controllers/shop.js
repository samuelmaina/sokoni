const {AdminSales} = require("../database/models");

const path = require("path");

const {Flash, Renderer, pipeInvoicePdf} = require("../util");

const {
  ProductForShop,
  UserForShop,
  OrderForShop,
} = require("../database/interfaces");

exports.getProductPerCategory = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const category = req.params.category;
    const categories = await ProductForShop.getPresentCategories();
    const {
      paginationData,
      products,
    } = await ProductForShop.findCategoryProducts(category, page);
    return new Renderer(res)
      .templatePath("shop/index")
      .pageTitle("Shop")
      .options({
        prods: products,
        paginationData,
        categories,
      })
      .activePath("/")
      .render();
  } catch (error) {
    next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const categories = await ProductForShop.getPresentCategories();
    const page = +req.query.page || 1;
    const {paginationData, products} = await ProductForShop.findProductsForPage(
      page
    );
    new Renderer(res)
      .templatePath("shop/index")
      .pageTitle("SM Online Shop")
      .activePath("/")
      .options({
        prods: products,
        paginationData,
        categories,
      })
      .render();
  } catch (error) {
    next(error);
  }
};
exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const {paginationData, products} = await ProductForShop.findProductsForPage(
      page
    );
    new Renderer(res)
      .templatePath("shop/product-list")
      .pageTitle("Products")
      .activePath("/products")
      .options({
        paginationData,
        prods: products,
      })
      .render();
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const page = +req.query.page || 1;
    const product = await ProductForShop.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }
    new Renderer(res)
      .templatePath("shop/product-detail")
      .pageTitle(product.title)
      .activePath("/product")
      .options({
        product,
        currentPage: page,
      })
      .render();
  } catch (error) {
    next(error);
  }
};

exports.getAddToCart = async (req, res, next) => {
  const {productId, page} = req.body;
  const product = await ProductForShop.findById(productId);
  new Renderer(res)
    .templatePath("shop/add-to-cart")
    .pageTitle("Add product")
    .options({
      product,
      page,
    })
    .render();
};
exports.postToCart = async (req, res, next) => {
  try {
    let {page, quantity, productId} = req.body;
    const previousData = req.body;
    let errorMessage, info;
    const renderer = new Renderer(res)
      .templatePath("shop/add-to-cart")
      .pageTitle("Add product")
      .options({
        page,
        previousData,
      });

    const product = await ProductForShop.findById(productId);
    renderer.options({
      product,
    });
    if (quantity < 1) {
      errorMessage = "add 1 or more products as quantity";
      return renderer.appendError(errorMessage).render();
    }
    const currentQuantity = product.getQuantity();
    if (currentQuantity < quantity) {
      info = `On stock quantity is ${currentQuantity}.Please request less quantity`;
      return renderer.appendInfo(info).render();
    }
    if (product) {
      const total = product.sellingPrice * quantity;
      const currentBalance = req.user.getCurrentBalance();
      if (!(currentBalance >= total)) {
        errorMessage = `Dear customer you don't have enough balance to complete
         this transaction. Please reduce your quantity or  recharge Kshs ${(
           total - currentBalance
         ).toFixed(2)} in your account and try again.`;
        return renderer.appendError(errorMessage).render();
      } else {
        await req.user.reduceBalance(total);
      }

      await req.user.addProductIdToCart(productId, quantity);
      await product.reduceQuantityBy(quantity);
    }
    new Flash(req, res)
      .appendInfo("Product successfully added to the cart")
      .redirect(`products?page=${page}`);
  } catch (error) {
    next(error);
  }
};
exports.getCart = async (req, res, next) => {
  try {
    const {
      cartProducts,
      total,
    } = await UserForShop.findCartProductsAndTheirTotalsForUserId(req.user._id);
    req.session.total = total;
    req.session.orderedProducts = cartProducts;

    new Renderer(res)
      .templatePath("shop/cart")
      .pageTitle("Your Cart")
      .options({
        products: cartProducts,
        total,
      })
      .activePath("/cart")
      .render();
  } catch (error) {
    next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const deletedQuantity = await req.user.deleteProductIdFromCart(prodId);
    res.redirect("/cart");
    const product = await ProductForShop.findById(prodId);
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
    const order = await OrderForShop.createNew(orderData);
    await req.user.clearCart();
    res.redirect("/orders");
    const populatedOrder = await OrderForShop.findByIdWithDetails(order._id);
    await addToAdminSales(populatedOrder.orderedProducts, next);
  } catch (error) {
    next(error);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await OrderForShop.findAllForUserId(req.user._id);
    if (orders)
      new Renderer(res)
        .templatePath("shop/orders")
        .pageTitle("Your Orders")
        .activePath("/orders")
        .options({
          orders,
        })
        .render();
  } catch (error) {
    next(error);
  }
};

exports.createInvoicePdf = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const orderId = req.params.orderId;
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("Data", "Invoices", invoiceName);
    const order = await OrderForShop.findByIdWithDetails(orderId);
    if (!order) {
      return flash.appendError("No such order exists").redirect("/orders");
    }
    if (!order.isOrderedById(req.user._id)) {
      return flash
        .appendError("You are not authorized to operate on this order")
        .redirect("/orders");
    }
    setHeaderForPiping(res, invoiceName);
    pipeInvoicePdf(order, invoicePath, res);
  } catch (error) {
    next(error);
  }
};

const setHeaderForPiping = (res, invoiceName) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="' + invoiceName + '"'
  );
};

const addToAdminSales = async (orderedProducts, next) => {
  try {
    for (const product of orderedProducts) {
      const productDetails = product.productData;
      let adminSales = await AdminSales.findOneForAdminId(
        productDetails.adminId
      );

      if (!adminSales) {
        adminSales = await AdminSale.createNew(productDetails.adminId);
      }
      const saleDetails = {
        quantity: product.quantity,
        productId: productDetails._id,
      };
      await adminSales.addOrderedProduct(saleDetails);
    }
  } catch (error) {
    next(error);
  }
};
