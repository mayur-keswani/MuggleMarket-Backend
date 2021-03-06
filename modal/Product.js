const mongoose=require('mongoose')
const Store = require('./Store')
const Schema = mongoose.Schema

const productSchema = new Schema({
	storeID:{
		type:Schema.Types.ObjectId,
		ref:'Store',
		required:true,
	},
	name:{
		type:String,
		required:true
	},
	description:{
		type:String,
		required:true
	},
	product_pic:{
		type:String,
		required:true
	},
	price:{
		type:Number,
		required:true
	},
	filterType:{
		type:String,
		
	}

},{
	timestamps:true
})

module.exports= mongoose.model('Product',productSchema)