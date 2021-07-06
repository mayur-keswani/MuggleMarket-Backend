const mongoose = require('mongoose');
const User = require('./User');
const Store = require('./Store')
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	user:{
		userID:{
			type:Schema.Types.ObjectId,
			ref:'User'
		},
		username:{
			type:String,
		},
		address:{
			type:String,
			required:true
		}
	},
	
	items:[{
		productID:{
			type:Schema.Types.ObjectId,
			ref:'Product'
		},
		name:{
			type:String,
			required:true
		},
		description:{
			type:String
		},
		product_pic:{
			type:String,
			required:true
		},
		quantity:{
			type:Number,
			required:true
		},
		price:{
			type:Number,
			required:true
		},
		storeID:{
			type:Schema.Types.ObjectId,
			ref:'Store'
		},
				
	}],
	charges:{
		type:Number,
		required:true,
	},
	grand_total:{
		type:Number,
		required:true
	}
})

module.exports= mongoose.model('Order',orderSchema)