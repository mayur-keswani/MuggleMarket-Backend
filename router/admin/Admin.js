const express = require('express')
const router= express.Router()
const User = require('../../modal/User')
const Store = require('../../modal/Store')
const isAuth = require('../../middleware/isAuth')

var cloudinary = require('cloudinary').v2;
const Product = require('../../modal/Product')
cloudinary.config({ 
    cloud_name: 'dra5wny0w', 
    api_key: '547648178774378', 
    api_secret: '41kiA96ypoOYXbN3cR41VAWC2fg' 
});

router.post('/create-your-store',isAuth,(req,res,next)=>{
	
	const storeName=req.body.storeName;
	const description=req.body.description;
	const address=req.body.address;
	const city=req.body.city;
	const storeType=req.body.storeType;
	const contactNo=req.body.contactNo;
	const landlineNo=req.body.landlineNo;
	const openingTime=req.body.openingTime;
	const closingTime=req.body.closingTime;
	const yearOfEstablishment=req.body.yearOfEstablishment;
	const storePicture = req.file.path;
	const ownerName=req.body.ownerName;
	const personalNo=req.body.personalNo;
	const social={
		personal_website:req.body.personalWebsite,
		instagram:req.body.instagram,
		youtube:req.body.youtube,
		facebook:req.body.facebook,
		
	}

	cloudinary.uploader
		.upload(storePicture, 
    			function(error, result) {

					if(!error) {
						const store = new Store({
							ownerID:req.user,
							name:storeName,
							description:description,
							address:address,
							city:city,
							store_type:storeType,
							contact_no:contactNo,
							landline_no:landlineNo,
							opening_time:openingTime,
							closing_time:closingTime,
							year_of_establish:yearOfEstablishment,
							social:social,
							owner:ownerName,
							personal_no:personalNo,
							store_picture: result.url,
						})
						store.save()
						.then(result=>{
							return User.findById(req.user)
							
						})
						.then(user=>{
						
							user.storeID.push(store._id)
							return user.save()
						})
						.then(result=>{
							res.status(201).json({message:"Store created successfully",store:store})
						})
						.catch(error=>{
							if(!error.statusCode){
								error.statusCode=500
							}
							console.log(error)
							next(error)
						})
					}else{
						const error = new Error("Image not uploaded !");
						next(error)
					}
					
				});
	
})

router.get('/my-store/:id',isAuth,(req,res,next)=>{
	Store.findById(req.params.id)
		.then(store=>{
			if(!store){
				const error = new Error("No Store Found")
				error.statusCode = 404
				throw error; 
			}else{
				res.status(200).json({store: store})
			}
		}).catch(error=>{
			if(!error.statusCode){
				error.statusCode = 500
			}
			next(error)
		})
})

router.post('/upload-items/:id',(req,res,next)=>{

	const name = req.body.name;
	const description = req.body.description;
	const product_pic = req.file.path
	const price = req.body.price
	
	
	cloudinary.uploader
		.upload(product_pic, 
    		function(error, result) {
				if(!error){
					const product = new Product({
						storeID:req.params.id,
						name: name,
						description: description,
						product_pic: result.url,
						price: price
					})
					product.save()
					  .then(product=>{
						  	return Store.findById(product.storeID)

							
						}).then(store=>{
							store.store_items.push(product)
							return store.save()
							
						}).then(result=>{
							console.log(product)
							res.status(201).json({product: product})
						})
					   .catch(error=>{
						   if(!error.statusCode)
								error.statusCode=500;

							next(error)
					   })
				}else{
					const error = new Error("Cloudinary not accessible")
					next(error)
				}
		})


	

})


module.exports = router