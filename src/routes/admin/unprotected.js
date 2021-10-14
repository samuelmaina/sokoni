const express = require("express");

const { admin } = require("../../controllers");

const { product, productQuery } = require("../../utils/validators");
const productValidtor = product.productValidator;
const productQueryValidator = productQuery.productQueryValidator;

const controller = admin;

const router = express.Router();

router.route("/").get(controller.getAdminPage);

module.exports = router;
