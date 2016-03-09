// load the things we need
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    businessname: String,
    address: String,
    doornumber: String,
    city: String,
    postcode: String,
    businesstype: String,
    firstname: String,
    lastname: String,
    mobile: String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
