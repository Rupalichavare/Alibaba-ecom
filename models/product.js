var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schem = new Schema({
    image: { type: String, require: true },
    tittle: { type: String, require: true },
    category: { type: String, require: true },
    price: { type: Number, require: true }
});

module.exports = mongoose.model('Product', schem);