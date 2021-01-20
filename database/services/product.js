const {PRODUCTS_PER_PAGE} = require("../../config/env");

exports.calculateSellingPrice = productData => {
  productData.sellingPrice = (
    (1 + productData.percentageProfit / 100.0) *
    productData.buyingPrice
  ).toFixed(2);
};

exports.calculatePaginationData = (page, total) => {
  return {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
};
exports.findCategoriesPresent = products => {
  let categories = [];
  for (const product of products) {
    let prodCategory = product.category;
    const categoryIndex = categories.findIndex(c => {
      return c === prodCategory;
    });
    if (categoryIndex < 0) {
      categories.push(prodCategory);
    }
  }
  return categories;
};
