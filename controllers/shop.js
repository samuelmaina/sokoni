const PDFDocument = require("pdfkit");
const {AdminSales, User} = require("../database/models");

const path = require("path");

const {Flash, Renderer} = require("../utils");

const {Product, Order} = require("../database/models");

exports.getIndex = async (req, res, next) => {
  try {
    const categories = await Product.findCategories();
    const page = +req.query.page || 1;
    const {paginationData, products} = await Product.findProductsForPage(page);
    new Renderer(res)
      .templatePath("shop/index")
      .pageTitle("SM Online Shop")
      .activePath("/")
      .appendDataToResBody({
        prods: products,
        paginationData,
        categories,
      })
      .render();
  } catch (error) {
    next(error);
  }
};
exports.getProductsPerCategory = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const category = req.params.category;
    const categories = await Product.findCategories();
    const {
      paginationData,
      products,
    } = await Product.findCategoryProductsForPage(category, page);
    return new Renderer(res)
      .templatePath("shop/index")
      .pageTitle(`${category}`)
      .appendDataToResBody({
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
    const categories = await Product.findCategories();
    const {paginationData, products} = await Product.findProductsForPage(page);

   console.log(products);
    new Renderer(res)
      .templatePath("shop/product-list")
      .pageTitle("Products")
      .activePath("/products")
      .appendDataToResBody({
        paginationData,
        prods: products,
        categories,
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
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }
    new Renderer(res)
      .templatePath("shop/product-detail")
      .pageTitle(product.title)
      .activePath("/product")
      .appendDataToResBody({
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
  const product = await Product.findById(productId);
  new Renderer(res)
    .templatePath("shop/add-to-cart")
    .pageTitle("Add To Cart")
    .appendDataToResBody({
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
      .pageTitle("Add To Cart")
      .appendDataToResBody({
        page,
        previousData,
      });

    const product = await Product.findById(productId);
    renderer.appendDataToResBody({
      product,
    });
    if (quantity < 1) {
      errorMessage = "add 1 or more products as quantity";
      return renderer.appendError(errorMessage).render();
    }
    const currentQuantity = product.quantity;
    if (currentQuantity < quantity) {
      info = `On stock quantity is ${currentQuantity}.Please request less quantity`;
      return renderer.appendInfo(info).render();
    }
    if (product) {
      const total = product.sellingPrice * quantity;
      const currentBalance = req.user.balance;
      if (!(currentBalance >= total)) {
        errorMessage = `Dear customer you don't have enough balance to complete
         this transaction. Please reduce your quantity or  recharge Kshs ${(
           total - currentBalance
         ).toFixed(2)} in your account and try again.`;
        return renderer.appendError(errorMessage).render();
      } else {
        await req.user.decrementBalance(total);
      }

      await req.user.addProductsToCart(productId, quantity);
      await product.decrementQuantity(quantity);
    }
    new Flash(req, res)
      .appendInfo("Product successfully added to cart.")
      .redirect(`products?page=${page}`);
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const {cart, total} = await req.user.populateCartProductsDetails();
    req.session.total = total;
    req.session.orderedProducts = cart;

    new Renderer(res)
      .templatePath("shop/cart")
      .pageTitle("Your Cart")
      .appendDataToResBody({
        products: cart,
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
    const userId = req.user._id;
    const orderData = {
      userId: userId,
      products: orderedProducts,
    };
    const order = await Order.createOne(orderData);
    await req.user.clearCart();
    res.redirect("/orders");
    await order.populateDetails();
    await addToAdminSales(order.products, next);
  } catch (error) {
    next(error);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAllforUserId(req.user._id);
    if (orders)
      new Renderer(res)
        .templatePath("shop/orders")
        .pageTitle("Your Orders")
        .activePath("/orders")
        .appendDataToResBody({
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
    const order = await Order.findByIdAndPopulateProductsDetails(orderId);
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
        adminSales = await AdminSales.createNew(productDetails.adminId);
      }
      const saleDetails = {
        quantity: product.quantity,
        productId: proquantityductDetails._id,
      };
      await adminSales.addOrderedProduct(saleDetails);
    }
  } catch (error) {
    next(error);
  }
};

const shopEmail = "samuelmainaonlineshop@gmail.com";
const shopName = "SM Online Shop.";
const shopMotto = "Online shop you can trust.";
const shopLogo = "public/logos/logo.png",
  footer = "Payment is due within 15 days. Thank you for shopping with us.";

async function pipeInvoicePdf(orderdetails, invoicePath, res) {
  const userDetails = await User.findById(orderdetails.getUserId());
  const ordererName = userDetails.getName();
  return new Promise((resolve, reject) => {
    try {
      let doc = new PDFDocument({
        margin: 50,
      });
      doc.pipe(res);
      generateHeader(doc);
      generateCustomerInformation(doc, orderdetails, ordererName);
      generateFooter(doc);
      generateInvoiceTable(doc, orderdetails);
      doc.end();
      resolve((done = true));
    } catch (error) {
      reject(new Error(error));
    }
  });
}

function generateHeader(doc) {
  doc
    .image(shopLogo, 50, 45, {
      width: 50,
    })
    .fillColor("#444444")
    .fontSize(20)
    .text(shopName, 110, 57)
    .fontSize(10)
    .text(shopEmail, 200, 65, {align: "right"})
    .fontSize(8)
    .text(shopMotto, 200, 80, {
      align: "right",
    })
    .moveDown();
}
function generateFooter(doc) {
  doc
    .fontSize(10)
    .font("Times-Roman")
    .text(footer, 50, 730, {align: "center", width: 500});
}

async function generateCustomerInformation(doc, orderdetails, ordererName) {
  doc
    .text(`Invoice Number: ${orderdetails._id}`, 50, 200)
    .text(`Invoice Date: ${new Date().toDateString()}`, 50, 215)
    .moveDown(3)
    .text(`Purchaser : ${ordererName}`, 50, 240)
    .moveDown(2);
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 150, y)
    .text(c3, 280, y, {width: 90, align: "right"})
    .text(c4, 370, y, {width: 90, align: "right"})
    .text(c5, 0, y, {align: "right"});
}

function generateInvoiceTable(doc, orderDetails) {
  let currentRowPosition = 300;
  doc
    .fontSize(12)
    .font("Times-Bold")
    .text("Title", 50, currentRowPosition)
    .text("Price", 150, currentRowPosition)
    .text("Quantity", 280, currentRowPosition, {width: 90, align: "right"})
    .text("Total", 370, currentRowPosition, {width: 90, align: "right"})
    .moveDown(0.5);
  const boughtProducts = orderDetails.getOrderedProducts();
  for (const product of boughtProducts) {
    const productDetails = product.productData;
    const total = productDetails.sellingPrice * product.quantity;
    currentRowPosition += 30;
    generateTableRow(
      doc,
      currentRowPosition,
      productDetails.title,
      productDetails.sellingPrice,
      product.quantity,
      total.toFixed(2)
    );
  }
  doc.text(
    `Total Payment: Kshs ${orderDetails.getTotal()}`,
    200,
    currentRowPosition + 30,
    {align: "center"}
  );
}
