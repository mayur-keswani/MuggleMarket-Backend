const mongoose = require('mongoose')
const User = require('./User')
const Schema = mongoose.Schema

const storeSchema = new Schema({
	ownerID:{
		type:Schema.Types.ObjectId,
		ref:'User',
		required:true
	},
	name:{
		type:String,
		required:true
	},
	description:{
		type:String,
		required:true
	},
	address:{
		type:String,
		required:true
	},
	city:{
		type:String,
		required:true
	},
	store_type:{
		type:String
	},
	contact_no:{
		type:Number,
		required:true
	},
	landline_no:{
		type:Number
	},
	opening_time:{
		type:String,
		required:true
	},
	closing_time:{
		type:String,
		required:true
	},
	year_of_establish:{
		type:Number
	},
	store_items:[{
		type:Schema.Types.ObjectId,
		ref:'Product'
	}],
	avg_expense:{
		type:Number,
	},
	owner:{
		type:String,
		required:true
	},
	personal_no:{
		type:Number
	},
	social:{
		personal_website:{ type:String },
		instagram:{ type:String },
		youtube:{ type:String },
		facebook:{ type:String },
	},
	store_picture:{
		type:String,
	}
},{
 timestamps:true
})

module.exports= mongoose.model('Store',storeSchema)