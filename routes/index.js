var express = require('express');
var app = require('express')();
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const crypto = require('crypto');
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(require('connect-history-api-fallback')())

var categoryModel = require('../models/category')
var articleModel = require('../models/articles');
var articleContentModel = require('../models/articleContent');
var userModel = require('../models/user');

var env = process.env.NODE_ENV || 'development';
var DB_CONN_STR = 'mongodb://user_runner:52bichang,@127.0.0.1:29999/user';
// var DB_CONN_STR = 'mongodb://127.0.0.1:29999/user';
if (env === 'development') {
	// DB_CONN_STR = 'mongodb://user_runner:52bichang,@127.0.0.1:29999/user';
	DB_CONN_STR = 'mongodb://localhost:27017/user';
}
mongoose.connect(DB_CONN_STR, {
	useMongoClient: true
});
mongoose.Promise = global.Promise;

function isJsonNull(json) {
	let n = 0;
	for (var name in json) {
		n++;
	}
	return n;
}

function propsFilter(items, props, exactly) {
	if (!Array.isArray) {
		Array.isArray = function(arg) {
			return Object.prototype.toString.call(arg) === '[object Array]'
		}
	}
	if (Array.isArray(items)) {
		const keys = Object.keys(props)
		return items.filter(function(item) {
			return keys.some(function(key) {
				if (exactly) {
					return item[key] === props[key]
				} else {
					const text = (props[key] + '').toLowerCase()
					return item[key] && item[key].toString().toLowerCase().indexOf(text) > -1
				}
			})
		})
	} else {
		return items
	}
}
var articleList = require('./test.js').articleList
var articleContentList = require('./test.js').articleContentList;
router.post('/login', function(req, res, next) {
	function aesDecrypt(encrypted, key) {
		const decipher = crypto.createDecipher('aes192', key);
		var decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}
	var password = aesDecrypt(req.body.password, 'pwd');
	userModel.find({
		'user_name': req.body.user_name,
		'password': password
	}, function(err, doc) {
		if (err) {
			console.log(err);
		} else {
			if (doc.length > 0) {
				global.token = Math.random();
				res.cookie('token', global.token, {
					maxAge: 900000,
					httpOnly: true
				});
				res.json({
					resultCode: 0,
					msg: '登录成功'
				});
			} else {
				res.json({
					resultCode: -1,
					msg: '用户名或密码错误!'
				});
			}
		}
	})
})

router.get('/category', function(req, res, next) {
	categoryModel.find({}, function(err, doc) {
		if (err) {
			console.log(err);
		} else {
			res.json({
				category_list: doc
			});
		}
	})
})

router.get('/test', function(req, res, next) {
	res.json({
		article_list: 123
	});
})

router.get('/article', function(req, res, next) {
	if (!isJsonNull(req.query)) {
		res.json({
			article_list: articleList    // mock数据可访问
		});

		// articleModel.find({}).exec(function(err, doc) {
		// 	console.log(doc);
		// 	if (err) {
		// 		console.log(err);
		// 	} else {
		// 		res.json({
		// 			article_list: doc
		// 		});
		// 	}
		// });
	} else {
		articleModel.find({
			'category_name': req.query.category_name
		}).exec(function(err, doc) {
			if (err) {
				console.log(err);
			} else {
				res.json({
					article_list: doc
				});
			}
		})
	}
	// resData.sort({
	// 	'date': 'desc'
	// }).exec(function(err, doc) {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		res.json({
	// 			article_list: doc
	// 		});
	// 	}
	// })
})

router.post('/article', function(req, res, next) {
	articleModel.create({
		"category_name": req.body.category_name,
		"add_article_time": req.body.add_article_time,
		// 'flagRandom': req.body.flagRandom,
		'isSaved': req.body.isSaved,
		"article_title": ''
	}, function(err, doc) {
		if (err) {
			res.json({
				msg: '增加文章失败'
			});
		} else {
			res.json({
				msg: '增加文章成功',
				article_item: doc
			});
		}
	})
})

router.put('/article', function(req, res, next) {
	articleModel.findByIdAndUpdate(req.body.article_id, {
		article_title: req.body.article_title,
		isSaved: req.body.isSaved
	}, function(err, doc) {
		if (err) {
			res.json({
				resultCode: 1,
				msg: '保存文章失败'
			});
		} else {
			res.json({
				resultCode: 0,
				msg: '更新文章成功',
				articleDetailList: doc
			});
		}
	})
})

router.delete('/article/:article_id', function(req, res, next) {
	articleModel.remove({
		_id: req.param('article_id')
	}, function(err, doc) {
		if (err) {
			res.json({
				resultCode: 1,
				msg: '删除文章失败'
			});
		} else {
			res.json({
				resultCode: 0,
				msg: '删除文章成功'
			});
		}
	})
})

router.get('/articleContent', function(req, res, next) {
	res.json({
		resultCode: 0,
		msg: '获取文章内容成功',
		articleDetailList: propsFilter(articleContentList, {
			article_id: req.query.article_id
		})
	})

	// articleContentModel.find({
	// 	article_id: req.query.article_id
	// }, function(err, doc) {
	// 	if (err) {
	// 		res.json({
	// 			resultCode: 1,
	// 			msg: '获取文章内容失败'
	// 		});
	// 	} else {
	// 		res.json({
	// 			resultCode: 0,
	// 			msg: '获取文章内容成功',
	// 			articleDetailList: doc
	// 		});
	// 	}
	// })
})

router.post('/articleContent', function(req, res, next) {
	articleContentModel.create({
		article_id: req.body.article_id,
		article_title: req.body.article_title,
		article_content: req.body.article_content,
		category_name: req.body.category_name,
		isSaved: req.body.isSaved
	}, function(err) {
		if (err) {
			res.json({
				resultCode: 1,
				msg: '增加文章失败'
			});
		} else {
			res.json({
				resultCode: 0,
				msg: '增加文章成功',
			});
		}
	})
})

router.put('/articleContent', function(req, res, next) {
	articleContentModel.update({
		article_id: req.body.article_id
	}, {
		article_title: req.body.article_title,
		article_content: req.body.article_content,
		category_name: req.body.category_name
	}, {
		multi: true
	}, function(err) {
		if (err) {
			res.json({
				resultCode: 1,
				msg: '更新文章失败'
			});
		} else {
			res.json({
				resultCode: 0,
				msg: '更新文章成功'
			});
		}
	})
})

router.delete('/articleContent/:article_id', function(req, res, next) {
	articleContentModel.remove({
		article_id: req.param('article_id')
	}, function(err, doc) {
		if (err) {
			res.json({
				resultCode: 1,
				msg: '删除文章失败'
			});
		} else {
			res.json({
				resultCode: 0,
				msg: '删除文章成功',
				data: doc
			});
		}
	})
})
module.exports = router;