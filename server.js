const dotenv=require('dotenv')
dotenv.config()
const express=require('express');
const morgan=require('morgan');
const DBconnection=require('./config/DBconnection');
const userRoute=require("./routes/user");
const storeRoute=require("./routes/store");
const categoryRoute=require('./routes/category');
const productRoute=require('./routes/product');
const purchaseRoute=require('./routes/purchasing');
const orderRoute=require('./routes/order');
const subCategory=require('./routes/subCategory');
const Brand=require('./routes/Brand');

const appError = require('./utils/appError');
const ErrorCtrl=require('./controllers/ErrorController');

const app=new express();
app.use(express.json());
app.use(morgan('dev'));
app.use("/api/user", userRoute);
app.use("/api/store",storeRoute);
app.use("/api/category",categoryRoute);
app.use("/api/product",productRoute);
app.use("/api/purchase",purchaseRoute);
app.use("/api/order",orderRoute);
app.use("/api/subCategory",subCategory);
app.use("/api/brand",Brand);

app.all('*',(req,res,next)=>{
    next(new appError(`cant find this route: ${req.originalUrl} in this server!`,404));
});
app.use(ErrorCtrl);

const DB=process.env.DB
const PORT=process.env.port 
DBconnection.connect(DB).then(()=>{
    console.log("CONNECTED TO DATABSE...");
    app.listen(PORT,()=>{
        console.log("the app is runing or port ",PORT);
    });
}).catch((err)=>{
    console.log(err);
});