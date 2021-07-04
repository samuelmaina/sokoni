exports.productQuantityValidator = (product, selectedQuantity) => {
	const currentQuantity = product.quantity;
	if (currentQuantity < selectedQuantity) {
		return `On stock quantity is ${currentQuantity}.Please request less quantity`;
	}
};
exports.cartTotalValidator = (
	alreadyCalculateTotal,
	productsTotal,
	balance
) => {
	const newTotal = alreadyCalculateTotal + productsTotal;
	if (!(balance >= newTotal)) {
		return `Dear customer you don't have enough balance to complete
         this transaction. Please reduce your quantity or  recharge Kshs ${(
						newTotal - balance
					).toFixed(2)} in your account and try again.`;
	}
};
