const btn = document.getElementById("delete");

btn.addEventListener("click", async (event) => {
  event.preventDefault();
  await request(btn);
});

async function request(btn) {
  try {
    const prodId = btn.parentNode.querySelector("[name=id]").value;
    const csurf = btn.parentNode.querySelector("[name=_csrf]").value;
    const productElement = btn.closest("article");

    const result = await fetch("/admin/product/" + prodId, {
      method: "DELETE",
      headers: {
        "csrf-token": csurf,
      },
    });

    if (result) {
      document.getElementsByClassName("info")[0].innerHTML =
        "Product successfully deleted.";
      productElement.parentNode.removeChild(productElement);
    }
  } catch (err) {
    console.log("This is the error," + err);
  }
}
