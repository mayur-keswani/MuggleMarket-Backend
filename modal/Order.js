const mongoose = require('mongoose');
const User = require('./User');
const Store = require('./Store')
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	user:{
		userID:{
			type:Schema.Types.ObjectId,
			ref:User
		},
		name:{
			type:String,
		},
		address:{
			type:String,
			required:true
		}
	},
	store:{
		type:Schema.Types.ObjectId,
		ref:Store
	},
	items:[{
		productID:{
			type:Schema.Types.ObjectId,
			ref:Product
		}
	}]
})

module.exports= mongoose.model('Order',orderSchema)