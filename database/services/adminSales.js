exports.addSoldProducts = (products, saleDetails) => {
  const productIndex = products.findIndex(product => {
    return product.productData.toString() === saleDetails.productId.toString();
  });
  const updatedProducts = [...products];
  if (productIndex >= 0) {
    updatedProducts[productIndex].sales.push({
      quantity: saleDetails.quantity,
      soldAt: Date.now(),
    });
  } else {
    updatedProducts.push({
      productData: saleDetails.productId,
      sales: [
        {
          quantity: saleDetails.quantity,
          soldAt: Date.now(),
        },
      ],
    });
  }
  return updatedProducts;
};
exports.getProductsWithinAnInterval = (products, fromTime, toTIme) => {
  const productsToDisplay = [];
  for (const product of products) {
    let salesMeetingCriterion = product.sales.filter(sale => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productData: product.productData,
      sales: salesMeetingCriterion,
    });
  }
  return productsToDisplay;
};
exports.calculatProductsSalesData = products => {
  let productsAndTheirProfits = [];
  products.forEach(product => {
    let profit = 0.0;
    let totalSales = 0.0;
    product.sales.forEach(sale => {
      const quantity = sale.quantity;
      const sellingPrice = product.productData.sellingPrice;
      const buyingPrice = product.productData.buyingPrice;
      totalSales += quantity * sellingPrice;
      profit += quantity * (sellingPrice - buyingPrice);
    });
    profit = profit.toFixed(2);
    totalSales = totalSales.toFixed(2);
    productsAndTheirProfits.push({
      title: product.productData.title,
      profit: profit,
      totalSales: totalSales,
      imageUrl: product.productData.imageUrl,
    });
  });
  productsAndTheirProfits.sort((el1, el2) => {
    return el1.profit <= el2.profit;
  });
  return productsAndTheirProfits;
};
