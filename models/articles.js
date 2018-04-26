var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
	article_title: String,
	category_name: String,
	isSaved: String,
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('article_lists', articleSchema);