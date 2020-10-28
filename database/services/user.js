exports.calculateProductsTotals = products => {
  let total = products.reduce(
    (total, next) => (total += next.productData.sellingPrice * next.quantity),
    0
  );
  return Number(total.toFixed(2));
};

exports.addProductIdToCart = (cart, prodId, quantity) => {
  let newQuantity = Number(quantity);
  if (!Number.isInteger(newQuantity) || newQuantity < 1) {
    throw new Error("Can only add quantity  greater than zero");
  }
  const productIndex = findProductIdIndexInArray(cart, prodId);

  const updateCart = [...cart];
  if (productIndex >= 0) {
    newQuantity = cart[productIndex].quantity + newQuantity;
    updateCart[productIndex].quantity = newQuantity;
  } else {
    updateCart.push({
      productData: prodId,
      quantity: newQuantity,
    });
  }
  return updateCart;
};
exports.deleteProductIdfromCart = (cart, prodId) => {
  const deletedProductIndex = findProductIdIndexInArray(cart, prodId);
  const deletedQuantity = cart[deletedProductIndex].quantity;
  const updatedCart = cart.filter(cp => {
    return cp.productData.toString() !== prodId.toString();
  });
  return {updatedCart, deletedQuantity};
};

const findProductIdIndexInArray = (arr, prodId) => {
  return arr.findIndex(cp => {
    return cp.productData.toString() === prodId.toString();
  });
};
