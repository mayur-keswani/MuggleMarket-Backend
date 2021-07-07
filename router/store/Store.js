const express = require('express')
const isAuth = require('../../middleware/isAuth')
const router= express.Router()
const Store = require('../../modal/Store')
const User = require('../../modal/User')
const Order = require('../../modal/Order');
const Product = require('../../modal/Product')

const accountSid = process.env.TRIVIA_ACCOUNT_SID; 
const authToken = process.env.TRIVIA_AUTH_TOKEN; 
const client = require('twilio')(accountSid, authToken); 
 

const sendWhatsappMessage = (order) =>{
	client.messages 
      		.create({ 
         		body: `You have revieved an order of ${order.items.map(item=> item.name+'('+item.price+')' )} items from ${order.user.username} at Rs${order.grand_total}.Pls. get it deliver at Address : ${order.user.address}  `, 
        		from: 'whatsapp:+14155238886',       
         		to: 'whatsapp:+919106963839' 
      		 }) 
			 .done()
}
router.get('/',(req,res)=>{
	Store.find()
		.then(stores=>{
			res.status(200).json({stores:stores})
		})
		.catch(error=>{
			if(!error.statusCode)
				error.statusCode=500
			next(error)
		})
})

router.get('/store/:id',(req,res,next)=>{
	const id=req.params.id
	Store.findById(id)
		.populate('store_items')
		.exec((err, store) =>{
			if(err){
				console.log(err)
				const error= new Error("Error in populate")
				next(error)
			}
			if(!store){
				const error = new Error('Store Not Found!')
				error.statusCode = 404;
				next(error) ;
			}else{
				res.status(200).json({store:store,message:"Store Found!"});
			}
		})
		
})

router.get('/my-stores',isAuth,(req,res)=>{
	Store.find({ownerID:req.user})
		.then((stores)=>{
			if(stores){
				res.status(200).json({stores:stores})
			}else{
				const error = new Error("No Stores Found !")
				error.status = 404
				throw error
			}
		}).catch(error =>{
			if(!error.statusCode)
				error.statusCode =500

			next(error)
		})
})

router.post('/checkout',isAuth,(req,res,next)=>{

	const orderItems = req.body
	console.log(orderItems)
	// [{productID:,productName:,productPrice,quantity}] => [{productID:,quantity}]
	const cart=orderItems.map(item=>{
		return {productID:item.productID,quantity:item.quantity}
	})
	console.log(cart)
	User.findById(req.user)
		.then(user=>{
			if(!user){
				const error = new Error("User not found")
				error.statusCode = 401;
			}
			user.cart=cart;
			user.save()
		})
		.then(result=>{
			res.status(201).json({cart: result,message:"Good To Proceed:)"})
		})
		.catch(error=>{
			next(error)
		})
})

router.post('/place-order',isAuth,(req,res,next)=>{
	const address=req.body.address;
	const charges = req.body.charges
	const grandTotal = req.body.grandTotal;
	const username = req.body.username
	const items = req.body.items;
	//console.log(items)
	const user = {
		userID:req.user,
		username:username,
		address:address,
	}
	const order = new Order({
		user:user,
		items:items,
		charges:charges,
		grand_total:grandTotal

	})
	 order.save()
	 	.then(order=>{
			sendWhatsappMessage(order)
			// console.log(message.sid)
		    res.status(201).json({message:"Your Order is successfully being placed",order:order})
		}) 
		.catch(error=>{
			if(!error.statusCode)
				error.statusCode=500

			next(error)
		})
})

router.get('/my-orders',isAuth,(req,res,next)=>{
	Order.find({'user.userID':req.user})
		.populate('items.productID')
		.then(orders=>{
			res.status(200).json({orders:orders})
		}).catch(error=>{
			if(!error.statusCode)
				error.statusCode=404;

			next(error)
		})
})

module.exports = router