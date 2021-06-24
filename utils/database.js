require('dotenv').config('../.env')
exports.mongoDB={
	url:
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.gpz6t.mongodb.net/${process.env.MONGODB_COLLECTION}?retryWrites=true&w=majority`
}