const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    userId: { type:Schema.Types.ObjectId, required: true },
    name: {
      type: String,
      required: true
    }
  }
});
module.exports = mongoose.model("Order", orderSchema);
