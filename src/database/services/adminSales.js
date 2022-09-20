const { convertTo2Dps } = require("../utils");

exports.addSale = (arr, productId, saleTotal) => {
  const saleTime = Date.now();
  const productIndex = arr.findIndex((product) => {
    return product.productData.toString() === productId.toString();
  });

  if (productIndex < 0) {
    arr.push({
      productData: productId,
      sales: {
        timeStamps: [saleTime],
        revenueTrend: [saleTotal],
      },
    });
  } else {
    const prevNoOfSales = arr[productIndex].sales.revenueTrend.length;
    const newTotal =
      arr[productIndex].sales.revenueTrend[prevNoOfSales - 1] * prevNoOfSales +
      saleTotal;
    arr[productIndex].sales.timeStamps.push(saleTime);
    arr[productIndex].sales.revenueTrend.push(newTotal / (prevNoOfSales + 1));
  }

  console.log(arr);
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
