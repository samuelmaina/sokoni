const assert = require("assert");

exports.update = {
  shortCode: {
    min: 100000,
    max: 900000,
    error: "Verification Code must be of 6 numbers.",
  },
};

exports.token = {
  requester: {
    minlength: 2,
    maxlength: 100,
    error: "The requester should be 2 to 100 characters long.",
  },
  howLong: {
    exact: 64,
    error: "The token to be generated should be 64 characters long.",
  },
};

exports.mongooseId = {
  exact: 24,
  error: "Should be a mongoose Id",
};

exports.maxImageSize = {
  lengthInBytes: 2 * 1000 * 1000,
  error: "Image must be less than 2 Mbs",
};

exports.notImage = {
  error:
    "Selected file is not an image! Select an image less than 2 MB in size.",
};
exports.base = {
  name: {
    minlength: 1,
    maxlength: 40,
    error: stringErrorGenerator("Name", 1, 40),
  },
  email: {
    minlength: 1,
    maxlength: 50,
    error: stringErrorGenerator("Email", 1, 50),
  },
  password: {
    minlength: 8,
    maxlength: 16,
    error: stringErrorGenerator("Password", 8, 16),
  },
  tel: {
    minlength: 10,
    maxlength: 13,
    error: stringErrorGenerator("Tel", 10, 13),
  },
};

exports.shop = {
  category: {
    minlength: 1,
    maxlength: 30,
    error: stringErrorGenerator("Category", 1, 30),
  },
  page: {
    min: 1,
    max: 200,
    error: intErrorGenerator("Page", 1, 200),
  },
};

exports.paymentMethods = [
  {
    method: "M-Pesa",
    numRegularExp:
      /^(?:254|\+254|0)?((?:(?:7(?:(?:[01249][0-9])|(?:5[789])|(?:6[89])))|(?:1(?:[1][0-5])))[0-9]{6})$/,
  },
];

exports.product = {
  title: {
    minlength: 3,
    maxlength: 100,
    error: stringErrorGenerator("Title", 3, 100),
  },
  //does not need error message.
  imageUrl: {
    minlength: 5,
    maxlength: 100,
  },
  buyingPrice: {
    min: 100,
    max: 200000,
    error: currencyErrorGenerator("Buying price", 100, 200000),
  },
  percentageProfit: {
    min: 0,
    max: 300,
    error: floatErrorGenerator("Percentage profit", 0, 300),
  },
  description: {
    minlength: 10,
    maxlength: 400,
    error: stringErrorGenerator("Description", 10, 400),
  },
  quantity: {
    min: 0,
    max: 20000,
    error: intErrorGenerator("Quantity", 0, 20000),
  },
  category: {
    minlength: 1,
    maxlength: 200,
    error: stringErrorGenerator("Category", 1, 200),
  },
  brand: {
    minlength: 1,
    maxlength: 20,
    error: stringErrorGenerator("Brand", 1, 20),
  },
};

exports.user = {
  balance: {
    min: 1,
    max: 2000000,
    error: currencyErrorGenerator("Balance", 1, 2000000),
  },
  quantity: {
    min: 1,
    max: 2000,
    error: intErrorGenerator("Quantity", 1, 2000),
  },
};

exports.order = {
  quantity: {
    min: 1,
    max: 2000,
    error: intErrorGenerator("Quantity", 1, 2000),
  },
  total: {
    min: this.product.buyingPrice.min,
    max: 2000000,
    error: intErrorGenerator("Total", this.product.buyingPrice.min, 2000000),
  },
};
exports.adminSales = {
  quantity: {
    min: 1,
    max: 20000,
  },
};

exports.metadata = {
  category: {
    minlength: 1,
    maxlength: 20,
    error: stringErrorGenerator("Category", 1, 20),
  },
  brand: {
    minlength: 1,
    maxlength: 20,
    error: stringErrorGenerator("Brand", 1, 20),
  },
};

exports.accounting = {
  amount: {
    min: 100,
    max: 200000,
    error: currencyErrorGenerator("Amount", 100, 200000),
  },
  paymentMethod: {
    minlength: 5,
    maxlength: 12,
    error: stringErrorGenerator("Payment method", 5, 12),
  },
};

assert.strictEqual(
  stringErrorGenerator("trial", 1, 200),
  "trial must be 1 to 200 characters long.",
  "The int error generator is not working"
);

function stringErrorGenerator(field, minlength, maxlength) {
  return `${field} must be ${minlength} to ${maxlength} characters long.`;
}

assert.strictEqual(
  intErrorGenerator("trial", 1, 20000),
  "trial must range from 1 to 20,000.",
  "The int error generator is not working"
);

function intErrorGenerator(field, min, max) {
  return (
    `${field} must range from ` +
    formatInt(min, ",") +
    ` to ` +
    formatInt(max, ",") +
    `.`
  );
}
assert.strictEqual(
  currencyErrorGenerator("trial", 1, 20000),
  "trial must range from Kshs 1.00 to Kshs 20,000.00. ",
  "The currency error generator is not working"
);
function currencyErrorGenerator(field, min, max) {
  return (
    `${field} must range from ` +
    formatIntoCurrenct(min) +
    ` to ` +
    formatIntoCurrenct(max) +
    `. `
  );
}
assert.strictEqual(
  floatErrorGenerator("trial", 1, 20000),
  "trial must range from 1.00 to 20,000.00.",
  "The float error generator is not working"
);
function floatErrorGenerator(field, min, max) {
  return (
    `${field} must range from ` +
    formatFloat(min) +
    ` to ` +
    formatFloat(max) +
    `.`
  );
}

function formatIntoCurrenct(real) {
  if (!(real >= 0)) {
    throw Error(`Value ${real} is not a postive number`);
  }
  let currencyToken = "Kshs ";
  return currencyToken.concat(formatFloat(real));
}
function formatFloat(real) {
  if (typeof real !== "number") {
    throw new Error("Value must be a number.");
  }
  const point = ".";
  const separator = ",";

  const numAsString = Number(real).toFixed(2);

  const splitNumbers = numAsString.split(point);

  const floatingPart = splitNumbers[1];
  const wholeNum = splitNumbers[0];

  let result = formatInt(wholeNum, separator);
  result += point;
  result += floatingPart;
  return result;
}

function formatInt(num, separator) {
  const numAsString = num.toString();
  const N = numAsString.length;

  let result = [];
  for (let i = N - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 == 0) {
      result.push(separator);
    }
    result.push(numAsString.charAt(i));
  }
  result = result.reverse();
  let final = "";
  for (const char of result) {
    final += char;
  }
  return final;
}
