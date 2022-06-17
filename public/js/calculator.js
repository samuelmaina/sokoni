import { formatIntoCurrency } from "/js/utils.js";

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
    shouldHideButton(true);
    isChanged = true;
  } else {
    if (isChanged) {
      resetToNormalDislay();
    }
    shouldHideButton(false);
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

  function shouldHideButton(predicate) {
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
  div.innerText =
    "No enough balance.Reduce the quantity or recharge account in the Dashboard";
  div.style.color = "rgb(252, 23, 23)";
  div.style.border = "3px solid rgb(252, 23, 23)";
  div.style.boxShadow = "2px 5px 20px rgba(245, 175, 175, 0.5)";
  div.style.borderRadius = "12px";
}
