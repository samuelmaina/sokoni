exports.resetCart = async user => {
  user.cart = [];
  await user.save();
};
exports.getTotals = (products = [], quantity) => {
  let total = 0.0;
  for (const product of products) {
    const {productData, quantity} = product;
    let sellingPrice = productData.sellingPrice;
    total += sellingPrice * quantity;
  }
  return Number(total.toFixed(2));
};

exports.addTRIALProductsToCart = async (user, products = [], quantity) => {
  for (const product of products) {
    await addProductToCart(user, product.id, quantity);
  }
};
const addProductToCart = async (user, productId, quantity) => {
  const userCart = user.cart;
  const productIndex = userCart.findIndex(product => {
    return product.productData.toString() === productId.toString();
  });
  const data = {
    productData: productId,
    quantity,
  };
  if (productIndex < 0) {
    userCart.push(data);
  } else {
    userCart[productIndex].quantity += quantity;
  }
  user.cart = userCart;
  user = await user.save();
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
