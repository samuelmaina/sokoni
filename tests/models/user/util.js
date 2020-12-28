exports.resetCart = async user => {
  user.cart = [];
  await user.save();
};
exports.getTotals = (products = []) => {
  let total = 0.0;
  for (const product of products) {
    const {productData, quantity} = product;
    let sellingPrice = productData.sellingPrice;
    total += sellingPrice * quantity;
  }
  return Number(total.toFixed(2));
};

exports.addTRIALProductsToCart = async (user, products = [], quantity) => {
  const cart = user.cart;
  for (const product of products) {
    addProductToCart(cart, product.id, quantity);
  }
  user.set("cart", cart);
  return await user.save();
};
const addProductToCart = async (cart, productId, quantity) => {
  const productIndex = cart.findIndex(product => {
    return product.productData.toString() === productId.toString();
  });
  const data = {
    productData: productId,
    quantity,
  };
  if (productIndex < 0) {
    cart.push(data);
  } else {
    cart[productIndex].quantity += quantity;
  }
};

exports.ensureProductsHaveProperties = (products, properties) => {
  for (const product of products) {
    properties.forEach(prop => {
      expect(product.productData).toHaveProperty(prop);
    });
  }
};
exports.productFound = (cart, productId) => {
  const productIndex = cart.findIndex(product => {
    return product.productData.toString() === productId.toString();
  });
  return productIndex >= 0;
};
