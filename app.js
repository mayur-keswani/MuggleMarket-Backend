const express = require('express')
const app = express()
const mongoose=require('mongoose')
const bodyParser = require('body-parser')
var cors = require('cors')

const multer = require('multer')

const db=require('./utils/database').mongoDB.url;


var cors = require('cors')
 
const AdminRouter=require('./router/admin/Admin')
const StoreRouter=require('./router/store/Store')
const AuthRouter=require('./router/auth/Auth');
//

app.use(express.static('./public'))
app.use(express.json())

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type');

  next();
})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/product_pics')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname, + '-' + Date.now())
  }
})
function fileFilter (req, file, cb) {
  if (file.mimetype==='jpg' || file.mimetype==='jpeg'|| file.mimetype==='png')
      cb(null, true)

  else
      cb(null, true)
}

  app.use(multer({ storage: storage , filefilter: fileFilter}).single('storeImage'))
 


  app.use(AdminRouter);
  app.use(StoreRouter);
  app.use(AuthRouter);

  app.use((error,req,res,next)=>{
    const status=error.statusCode || 500;
    // console.log(error.message)
    const message=error.message
    res.status(status).json({message:message})
    next();
  })
  mongoose.connect(
      db,{
       useNewUrlParser: true,
       useUnifiedTopology:true
      })
    .then(()=>{
      app.listen(8080,()=>{console.log("you are live....")})
    })
    .catch((error=>{
      console.log(error)
    }))
  

