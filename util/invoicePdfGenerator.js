const fs = require("fs");
const PDFDocument = require("pdfkit");
const {User}= require('../database/interfaces/auth');



module.exports = function createInvoice(orderdetails, invoicePath) {
  return new Promise((resolve, reject) => {
    try {
      let doc = new PDFDocument({
        margin: 50
      });
      generateHeader(doc);
      generateCustomerInformation(doc, orderdetails);
      generateFooter(doc);
      generateInvoiceTable(doc, orderdetails);
      doc.end();
      doc.pipe(fs.createWriteStream(invoicePath));
      resolve((done = true));
    } catch (error) {
      reject(new Error(error));
    }
  });
};

function generateHeader(doc) {
  doc
    .image("public/logo/logo.png", 50, 45, {
      width: 50
    })
    .fillColor("#444444")
    .fontSize(20)
    .text("SM Online Shop.", 110, 57)
    .fontSize(10)
    .text("samuelmainaonlineshop@gmail.com", 200, 65, { align: "right" })
    .fontSize(8)
    .text("Online shop you can trust.", 200, 80, {
      align: "right"
    })
    .moveDown();
}
function generateFooter(doc) {
  doc
    .fontSize(10)
    .font("Times-Roman")
    .text(
      "Payment is due within 15 days. Thank you for shopping with us.",
      50,
      730,
      { align: "center", width: 500 }
    );
}

 async function generateCustomerInformation(doc, orderdetails) {
  doc
    .text(`Invoice Number: ${orderdetails._id}`, 50, 200)
    .text(`Invoice Date: ${new Date()}`, 50, 215)
    .moveDown(3)
    .text(`Purchaser : ${ await User.findById(orderdetails.userId).select('name')}  `, 50, 240)
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
  const boughtProducts = orderDetails.orderedProducts;
  for (const product of boughtProducts) {
    const productDetails=product.productData;
    const total =productDetails.price* product.quantity;
    currentRowPosition += 30;
    generateTableRow(
      doc,
      currentRowPosition,
      productDetails.title,
      productDetails.price,
      product.quantity,
      total.toFixed(2)
    );
  }
  doc.text(
    `Total Payment: Kshs ${orderDetails.total}`,
    200,
    currentRowPosition + 30,
    { align: "center" }
  );
}
