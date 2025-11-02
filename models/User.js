const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: String,
  email: { type: String, index: true, unique: true },
  password: String
});
module.exports = mongoose.model('User', UserSchema);
