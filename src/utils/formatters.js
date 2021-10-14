exports.formatIntoCurrency = (real) => {
  const numberized = Number(real);
  if (!(numberized >= 0)) {
    throw Error(`Value ${numberized} is not a postive number`);
  }
  let currencyToken = "Kshs ";
  return currencyToken.concat(this.formatFloat(numberized));
};
exports.formatFloat = (real) => {
  if (typeof real !== "number") {
    throw new Error("Value must be a number.");
  }
  const point = ".";
  const separator = ",";

  const numAsString = Number(real).toFixed(2);

  const splitNumbers = numAsString.split(point);

  const floatingPart = splitNumbers[1];
  const wholeNum = splitNumbers[0];

  let result = this.formatInt(wholeNum, separator);
  result += point;
  result += floatingPart;
  return result;
};

exports.formatInt = function (num, separator) {
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
};
