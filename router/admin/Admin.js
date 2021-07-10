const express = require('express')
const router= express.Router()
const User = require('../../modal/User')
const Store = require('../../modal/Store')
const isAuth = require('../../middleware/isAuth');
const deleteFile = require('../../utils/deleteFileHelper')

var cloudinary = require('cloudinary').v2;
const Product = require('../../modal/Product')
cloudinary.config({ 
    cloud_name: 'dra5wny0w', 
    api_key: '547648178774378', 
    api_secret: '41kiA96ypoOYXbN3cR41VAWC2fg' 
});

const getData = (req) => {
	const object={
		 storeName:req.body.storeName,
		 description:req.body.description,
		 address:req.body.address,
		 city:req.body.city,
		 storeType:req.body.storeType,
		 contactNo:req.body.contactNo,
		 landlineNo:req.body.landlineNo,
		 openingTime:req.body.openingTime,
		 closingTime:req.body.closingTime,
		 yearOfEstablishment:req.body.yearOfEstablishment, 
		 ownerName:req.body.ownerName,
		 personalNo:req.body.personalNo,
		 social:{
			personal_website:req.body.personalWebsite,
			instagram:req.body.instagram,
			youtube:req.body.youtube,
			facebook:req.body.facebook,	
		 }
	};

	return object;
}
 const cloudinaryUploader = async(path) =>{
	let imageURL="";
	 await cloudinary.uploader
		.upload(path,(error,result)=>{
			if(error){
				imageURL=""
			}
			console.log("49-"+result.url);
			imageURL= result.url
		})
		return imageURL
			
 }

router.post('/create-your-store',isAuth,async(req,res,next)=>{
	
	const outletDetails=getData(req);
	let imageURL="";
	if(req.file){
		imageURL=await cloudinaryUploader(req.file.path)
		
	}
	console.log(imageURL);
		const store = new Store({
			ownerID:req.user,
			name:outletDetails.storeName,
			description:outletDetails.description,
			address:outletDetails.address,
			city:outletDetails.city,
			store_type:outletDetails.storeType,
			contact_no:outletDetails.contactNo,
			landline_no:outletDetails.landlineNo,
			opening_time:outletDetails.openingTime,
			closing_time:outletDetails.closingTime,
			year_of_establish:outletDetails.yearOfEstablishment,
			social:outletDetails.social,
			owner:outletDetails.ownerName,
			personal_no:outletDetails.personalNo,
			store_picture: imageURL,
		})
			store.save()
				.then(result=>{
					//deleteFile(req.file.path)
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
					
	
})

router.post('/edit-your-store/:id',isAuth,async(req,res,next)=>{
	const id=req.params.id;
	const outletDetails=getData(req)
	let imageURL="";
	if(req.file){
		imageURL=await cloudinaryUploader(req.file.path)
	}
	
	Store.findById(id)
	.then(store=>{
		if(store){
			
			if(store.ownerID.toString() === req.user.toString()){
				 store.name=outletDetails.storeName;
				 store.description=outletDetails.description;
				 store.address=outletDetails.address;
				 store.city=outletDetails.city;
				 store.store_type=outletDetails.storeType;
				 store.contact_no=outletDetails.contactNo;
				 store.landline_no=outletDetails.landlineNo;
				 store.opening_time=outletDetails.openingTime;
				 store.closing_time=outletDetails.closingTime;
				 store.year_of_establish=outletDetails.yearOfEstablishment;
				 store.social=outletDetails.social;
				 store.owner=outletDetails.ownerName;
				 store.personal_no=outletDetails.personalNo
				 if(imageURL)
				 	{store.store_picture= imageURL}
							
				 store.save()
						.then(store=>{
							console.log(store)
							 res.status(201).json({store:store,message:"Store Update Successfullys"})
						 })
						 .catch(error=>{
							 console.log(error)
							 next(error)
						 })
				
			}else{
				const error = new Error("You are not authorized to edit store details");
				error.statusCode=401;
				throw new Error(error);
			}
		}
	})
	.catch(error=>{
		if(!error.statusCode)
			error.statusCode=500;

		next(error);
	})
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

router.post('/upload-items/:id',async(req,res,next)=>{
	console.log(req.body)
	const name = req.body.name;
	const description = req.body.description;
	const product_pic = req.file.path
	const price = req.body.price
	const filterType = req.body.filter;
	const productURL=await cloudinaryUploader(product_pic)

					const product = new Product({
						storeID:req.params.id,
						name: name,
						description: description,
						product_pic: productURL,
						price: price,
						filterType:filterType
					})
					product.save()
					  .then(product=>{
						  	console.log(product)
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
				
})


module.exports = router