var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userschem = new Schema({
    email: { type: String, require: true },
    password: { type: String, require: true },
    name: { type: String, require: true },
    mobile: { type: String, require: true }

});

userschem.methods.validPassword=function(password){
    return (password==this.password);
}
module.exports = mongoose.model('User', userschem);
