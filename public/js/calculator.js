const quantity = getValueByName("quantity");
const originalStyle = { ...document.getElementById("balance").style };

let total = Number(getValueById("total"));
let balance = getValueById("balance");

let sellingPrice = document.getElementById("sellingPrice").value;
let isChanged = false;
quantity.addEventListener("keyup", (e) => {
  let { remaining, currentTotal } = getRemainingBalance();

  currentTotal = formatIntoCurrency(currentTotal);

  writeById("total", currentTotal);

  if (remaining < 0) {
    renderOutOfBalance();
    hideButton(true);
    isChanged = true;
  } else {
    if (isChanged) {
      resetToNormalDislay();
    }
    hideButton(false);
    writeById("balance", formatIntoCurrency(remaining));
    isChanged = false;
  }

  function getRemainingBalance() {
    const latestQuantity = getValueByName("quantity").value;
    const added = Number(latestQuantity * sellingPrice);
    const currentTotal = total + added;
    return {
      currentTotal,
      remaining: balance - currentTotal,
    };
  }

  function hideButton(predicate) {
    const button = document.getElementById("push-to-cart-btn");

    if (predicate) {
      button.disabled = predicate;
      button.style.filter = " grayscale(0.3)";
    } else {
      button.disabled = predicate;
      button.style.filter = " grayscale(0)";
    }
  }
});

function getValueByName(name) {
  return document.getElementsByName(name)[0];
}

function getElamentsByClassName(className) {
  return document.getElementsByClassName(className);
}

function getValueById(id) {
  return document.getElementById(id).innerText;
}

function writeById(id, value) {
  document.getElementById(id).innerText = value;
}

function resetToNormalDislay() {
  document.getElementById("hidable").style.display = "block";
  document.getElementById("balance").style = originalStyle;
}

function renderOutOfBalance() {
  const div = document.getElementById("balance");
  document.getElementById("hidable").style.display = "none";
  div.innerText = "Balance too low,please reduced the quantity.";
  div.style.color = "rgb(252, 23, 23)";
  div.style.border = "3px solid rgb(252, 23, 23)";
  div.style.boxShadow = "2px 5px 20px rgba(245, 175, 175, 0.5)";
  div.style.borderRadius = "12px";
}

function formatIntoCurrency(real) {
  const numberized = Number(real);
  if (!(numberized >= 0)) {
    throw Error(`Value ${numberized} is not a postive number`);
  }
  let currencyToken = "Kshs ";
  return currencyToken.concat(formatFloat(numberized));
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
