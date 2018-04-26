var mongoose = require('mongoose');

var categorySchema = mongoose.Schema({
	value: String
})

module.exports = mongoose.model('category_lists', categorySchema);