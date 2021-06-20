exports.mongooseId = 24;
exports.base = {
  name: {
    minlength: 5,
    maxlength: 20,
    error: stringErrorGenerator("Name", 5, 20),
  },
  email: {
    minlength: 8,
    maxlength: 25,
    error: stringErrorGenerator("Email", 8, 25),
  },
  password: {
    minlength: 8,
    maxlength: 15,
    error: stringErrorGenerator("Password", 8, 15),
  },
  tel: 13,
};

exports.product = {
  title: {
    minlength: 5,
    maxlength: 20,
    error: stringErrorGenerator("Title", 5, 20),
  },
  //does not need error message.
  imageUrl: {
    minlength: 5,
    maxlength: 100,
  },
  buyingPrice: {
    min: 1,
    max: 100000,
    error: currencyErrorGenerator("Buying price", 1, 200000),
  },
  percentageProfit: {
    min: 0,
    max: 300,
    error: floatErrorGenerator("Percentage profit", 0, 300),
  },
  description: {
    minlength: 10,
    maxlength: 40,
    error: stringErrorGenerator("Description", 10, 40),
  },
  quantity: {
    min: 1,
    max: 20000,
    error: intErrorGenerator("Quantity", 1, 20000),
  },
  category: {
    minlength: 5,
    maxlength: 20,
    error: stringErrorGenerator("Category", 5, 20),
  },
  brand: {
    minlength: 5,
    maxlength: 20,
    error: stringErrorGenerator("Brand", 5, 20),
  },
};

exports.user = {
  balance: {
    min: 1,
    max: 20000,
    error: currencyErrorGenerator("Balance", 1, 20000),
  },
  quantity: {
    min: 0,
    max: 2000,
    error: intErrorGenerator("Quantity", 0, 2000),
  },
};
exports.tokenGen = {
  token: 64,
};
exports.order = {
  quantity: {
    min: 0,
    max: 2000,
  },
};
exports.adminSales = {
  quantity: {
    min: 0,
    max: 20000,
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

function stringErrorGenerator(field, minlength, maxlength) {
  return `${field} must be ${minlength} to ${maxlength} characters long.`;
}
function intErrorGenerator(field, min, max) {
  return (
    `${field}  must range from ` +
    formatInt(min) +
    ` to ` +
    formatInt(max) +
    ` .`
  );
}
function currencyErrorGenerator(field, min, max) {
  return (
    `${field} must range from ` +
    formatIntoCurrenct(min) +
    ` to ` +
    formatIntoCurrenct(max) +
    `. `
  );
}
function floatErrorGenerator(field, min, max) {
  return (
    `${field} must range from ` +
    formatFloat(min) +
    ` to ` +
    formatFloat(max) +
    ` .`
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
  const N = num.length;
  let result = [];
  for (let i = N - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 == 0) {
      result.push(separator);
    }
    result.push(num.charAt(i));
  }
  result = result.reverse();
  let final = "";
  for (const char of result) {
    final += char;
  }
  return final;
}
