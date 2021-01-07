exports.addSale = (productArray, saleDetails) => {
  const productIndex = productArray.findIndex(product => {
    return product.productData.toString() === saleDetails.productId.toString();
  });
  const updatedProducts = [...productArray];
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

exports.getProductsSalesSoldWithinInterval = (products, fromTime, toTIme) => {
  const productsToDisplay = [];
  for (const product of products) {
    let salesSoldWithinInterval = product.sales.filter(sale => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productData: product.productData,
      sales: salesSoldWithinInterval,
    });
  }
  return productsToDisplay;
};

exports.calculatProductsSalesData = products => {
  let productsAndTheirProfits = [];
  products.forEach(product => {
    let profit = 0.0;
    let total = 0.0;
    calculateSalesTotalAndProfit();
    const {title, imageUrl, sellingPrice, buyingPrice} = product.productData;
    productsAndTheirProfits.push({
      title,
      profit,
      total,
      imageUrl,
    });
    const calculateSalesTotalAndProfit = () => {
      product.sales.forEach(sale => {
        const quantity = sale.quantity;
        total += quantity * sellingPrice;
        profit += quantity * (sellingPrice - buyingPrice);
      });
    };
  });
  productsAndTheirProfits.sort((el1, el2) => {
    return el1.profit <= el2.profit;
  });
  return productsAndTheirProfits;
};
