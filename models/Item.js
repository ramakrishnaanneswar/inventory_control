const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ItemSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  sku: String,
  qty: Number,
  price: Number,
  created: Number
});
module.exports = mongoose.model('Item', ItemSchema);
