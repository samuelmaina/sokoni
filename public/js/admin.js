const deleteProduct = btn => {
  const prodId = btn.parentNode.querySelector("[name=id]").value;
  const csurf = btn.parentNode.querySelector("[name=_csrf]").value;
  const productElement = btn.closest("article");
  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csurf,
    },
  })
    .then(result => console.log(result))
    .then(data => {
      productElement.parentNode.removeChild(productElement);
    })
    .catch(err => console.log(err));
};
