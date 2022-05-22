const { convertTo2Dps } = require("../utils");

exports.addSale = (arr, saleDetails) => {
  const { productId, quantity } = saleDetails;
  const productIndex = arr.findIndex((product) => {
    return product.productData.toString() === productId.toString();
  });

  const sale = {
    quantity,
    soldAt: Date.now(),
  };
  if (productIndex < 0) {
    arr.push({
      productData: productId,
      sales: [sale],
    });
  } else {
    arr[productIndex].sales.push(sale);
  }
};

exports.getProductsSalesSoldWithinInterval = (products, fromTime, toTIme) => {
  const productsToDisplay = [];
  for (const product of products) {
    let salesSoldWithinInterval = product.sales.filter((sale) => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productData: product.productData,
      sales: salesSoldWithinInterval,
    });
  }
  return productsToDisplay;
};

exports.calculatProductsSalesData = (products) => {
  let productsAndTheirProfits = [];
  products.forEach((product) => {
    let profit = 0.0;
    let total = 0.0;
    calculateSalesTotalAndProfit();

    productsAndTheirProfits.push({
      productData: product.productData,
      total,
      profit,
      sales: product.sales,
    });
    function calculateSalesTotalAndProfit() {
      const { sellingPrice, buyingPrice } = product.productData;
      product.sales.forEach((sale) => {
        const quantity = sale.quantity;
        total += quantity * sellingPrice;
        profit += quantity * (sellingPrice - buyingPrice);
      });
      total = convertTo2Dps(total);
      profit = convertTo2Dps(profit);
    }
  });
  productsAndTheirProfits.sort((el1, el2) => {
    return el1.profit <= el2.profit;
  });
  return productsAndTheirProfits;
};
