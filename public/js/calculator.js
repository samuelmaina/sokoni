let total = getValueById("total");
let balance = getValueById("balance");

let sellingPrice = document.getElementById("sellingPrice").value;

let count = 0;

function getValueById(id) {
  return document.getElementById(id).innerText;
}

const quantity = getValueByName("quantity");
quantity.addEventListener("keyup", (e) => {
  const latest = getValueByName("quantity");
  const current = Number((latest.value * sellingPrice).toFixed(2));
  writeById("total", current);
  writeById("balance", balance - current);
});

function getValueByName(name) {
  return document.getElementsByName(name)[0];
}

function writeById(id, value) {
  document.getElementById(id).innerText = value;
}

console.log(total, balance, quantity);
