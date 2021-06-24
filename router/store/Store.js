const express = require('express')
const isAuth = require('../../middleware/isAuth')
const router= express.Router()
const Store = require('../../modal/Store')
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


module.exports = router