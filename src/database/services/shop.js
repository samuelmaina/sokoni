const PDFDocument = require("pdfkit");
const {
  formatIntoCurrency,
  formatInt,
  formatFloat,
} = require("../../utils/formatters");

exports.productQuantityValidator = (product, selectedQuantity) => {
  const currentQuantity = product.quantity;
  if (selectedQuantity < 1) {
    return `Quantity added must be one or greater.`;
  }
  if (currentQuantity < selectedQuantity) {
    return `On stock quantity is ${formatInt(
      currentQuantity,
      ","
    )}.Please request less quantity`;
  }
};
exports.cartTotalValidator = (
  alreadyCalculateTotal,
  productsTotal,
  balance
) => {
  const newTotal = alreadyCalculateTotal + productsTotal;
  if (!(balance >= newTotal)) {
    return `Dear customer you don't have enough balance to complete
         this transaction. Please reduce your quantity or  recharge Kshs ${formatFloat(
           Number((newTotal - balance).toFixed(2))
         )} in your account and try again.`;
  }
};

exports.pipeInvoicePdf = async function (orderdetails, res, User) {
  const shopEmail = "samuelmainaonlineshop@gmail.com",
    shopName = "Sokoni.",
    shopMotto = "Online shop you can trust.",
    shopLogo = "public/logos/logo.png",
    footer = "Payment is due within 15 days. Thank you for shopping with us.";
  const userDetails = await User.findById(orderdetails.userId);
  const ordererName = userDetails.name;
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

  function generateHeader(doc) {
    doc
      .image(shopLogo, 50, 45, {
        width: 50,
      })
      .fillColor("#444444")
      .fontSize(20)
      .text(shopName, 110, 57)
      .fontSize(10)
      .text(shopEmail, 200, 65, { align: "right" })
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
      .text(footer, 50, 730, { align: "center", width: 500 });
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
      .text(c3, 280, y, { width: 90, align: "right" })
      .text(c4, 370, y, { width: 90, align: "right" })
      .text(c5, 0, y, { align: "right" });
  }

  function generateInvoiceTable(doc, orderDetails) {
    let currentRowPosition = 300;
    doc
      .fontSize(12)
      .font("Times-Bold")
      .text("Title", 50, currentRowPosition)
      .text("Price", 150, currentRowPosition)
      .text("Quantity", 280, currentRowPosition, { width: 90, align: "right" })
      .text("Total", 370, currentRowPosition, { width: 90, align: "right" })
      .moveDown(0.5);
    const boughtProducts = orderDetails.products;
    for (const product of boughtProducts) {
      const productDetails = product.productData;
      const total = productDetails.sellingPrice * product.quantity;
      currentRowPosition += 30;
      generateTableRow(
        doc,
        currentRowPosition,
        productDetails.title,
        formatIntoCurrency(productDetails.sellingPrice),
        formatInt(product.quantity, ","),
        formatIntoCurrency(total.toFixed(2))
      );
    }
    doc.text(
      `Total Payment:     ${formatIntoCurrency(orderDetails.total)}`,
      200,
      currentRowPosition + 30,
      { align: "center" }
    );
  }
};
