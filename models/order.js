var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schem = new Schema({
    user: { type: Schema.Types.ObjectId, require: true },
    cart: { type: Object, require: true },
    name: { type: String, require: true },
    email: { type: String, require: true },
    mobile: { type: String, require: true },
    paymentId: { type: String, require: true },
    time: { type: String, require: true }
});

module.exports = mongoose.model('Order', schem);