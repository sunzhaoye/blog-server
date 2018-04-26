var mongoose = require('mongoose');

var articleContentSchema = mongoose.Schema({
	article_id: String,
	article_title: String,
	article_content: String,
	category_name: String,
	isSaved: String,
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('article_content_lists', articleContentSchema);