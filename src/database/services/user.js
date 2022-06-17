exports.calculateProductsTotals = (products) => {
  let total = products.reduce(
    (total, next) => (total += next.productData.sellingPrice * next.quantity),
    0
  );
  return Number(total.toFixed(2));
};

exports.addProductIdToCart = (cart, prodId, quantity) => {
  const productIndex = findProductIdIndexInArray(cart, prodId);
  if (productIndex >= 0) {
    cart[productIndex].quantity += quantity;
  } else {
    cart.push({
      productData: prodId,
      quantity,
    });
  }
};

exports.deleteProductIdfromCart = (cart, prodId) => {
  const deletedProductIndex = findProductIdIndexInArray(cart, prodId);
  const deletedQuantity = cart[deletedProductIndex].quantity;
  const updated = cart.filter((cp) => {
    return cp.productData.toString() !== prodId.toString();
  });
  return { updated, deletedQuantity };
};

const findProductIdIndexInArray = (arr, prodId) => {
  return arr.findIndex((cp) => {
    return cp.productData.toString() === prodId.toString();
  });
};
