// grab the mongoose module
var mongoose = require('mongoose');

// define the schema for our user model
var quoteSchema = mongoose.Schema({
	jobName: String,
	vanType: String,
	porterQty: String,
	jobDate: String,
	fuelPrice: Number,
	suggestedPrice: Number,
	address: {},
	distance: Number,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Quote', quoteSchema);
