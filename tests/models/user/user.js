let TRIALS;
let user;

exports.resetCart = async () => {
  user.cart = [];
  await user.save();
};
exports.getTotals = () => {
  let total = 0.0;
  for (let index = 0; index < TRIALS; index++) {
    let sellingPrice = products[index].sellingPrice;
    total += sellingPrice * TRIALS;
  }
  return Number(total.toFixed(2));
};

exports.addTRIALProductsToCart = async () => {
  for (let index = 0; index < TRIALS; index++) {
    await addProductToCart(products[index].id, TRIALS);
  }
};
const addProductToCart = async (productId, quantity) => {
  const userCart = user.cart;
  const productIndex = userCart.findIndex((product) => {
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

exports.productFound = (productId) => {
  const userCart = user.cart;
  const productIndex = userCart.findIndex((product) => {
    return product.productData.toString() === productId.toString();
  });
  return productIndex >= 0;
};
