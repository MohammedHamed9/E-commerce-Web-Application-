const User=require("../models/userModel");
const Product=require("../models/productModel");
const jwt=require("jsonwebtoken");
const appError = require('../utils/appError');
const crypto=require('crypto');
const util=require('util');
const fs=require('fs');
const fsunlink=util.promisify(fs.unlink);
const EmailCtrl=require('../utils/email');
const signToken=(id)=>{
    const token=jwt.sign({id:id},process.env.JWT_SECRET,
        {expiresIn:process.env.EXPIRED_DATE})
    return token
}
const filterBody=(body,...allowedfields)=>{
    const filteredObject={};
    Object.keys(body).forEach(el=>{
        if(allowedfields.includes(el)) 
        filteredObject[el]=body[el]
    });
    return filteredObject;

}
const createCookie=(token,res)=>{
    const cookieOptions=
    {
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_DATE*24*60*60*1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV=='production') cookieOptions.secure=true
    res.cookie('jwt',token,cookieOptions);
}       

const userCtrl=
{
createUser:async(req,res)=>{
    const {name,email,password,phone,role}=req.body;
    const user=await User.create(req.body);
    res.status(201).json({
        message:"the user is created"
    });
},
signUp:async(req,res,next)=>{
    try{
    const {name,email,password,phone}=req.body;
    let avatar="";
    if (req.file && req.file.path) {
        avatar = req.file.path;
    }
    const user=await User.create({name,email,password,phone,avatar});
    //remove the password from response.
    user.password=undefined;

    const token=signToken(user._id);
    createCookie(token,res);
    res.status(201).json({
        message:"welcome to our stores..",
        token,
        user
    })
}catch(err){
    console.log(err)
    next(new appError('somthing went wrong!',500));
}
},
login: async(req,res,next)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password)
            return res.status(500).json({
                message:"please provide your email and password to login!"
                });
        const user=await User.findOne({email:email});
        if(!user || !await user.correctPassword(password,user.password)){
            return res.status(500).json({
                message:"the email or the password is wrong!"
        })
    }
    const token=signToken(user._id);
    createCookie(token,res);
    res.status(201).json({
        message:"welcome to our stores..",
        token
    })
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
    
},
logout:(req,res,next)=>{
   res.cookie('jwt','loggedout',{
    expires:new Date (Date.now()+10*1000),
    httpOnly:true
   });
   res.status(200).json({
    message:'loggedout successfully..'
   });
},
//NOT IMPLMENTED
getAllUsers:async(req,res,next)=>{
    const filter=req.body.filter;
            //find the products with this categoryId
            const products=await Product.find({category_id:{$in:filter}});

            const productIds=products.map(el=> el._id);  
            console.log(productIds);
            res.json({
                products
            })
},
getUser:async(req,res,next)=>{
    try{
        //const users=await User.find({'cart.products.product':req.params.id});
        const productIds=req.body.productIds;
        await User.updateMany({
            'cart.products.product':{$in:productIds}},
            {$pull:{'cart.products':{ product:{$in:productIds}}} });
        res.status("200").json({
            message:"done"
        })
    }
    catch(error){
        console.log(error);
        next(new appError('something went wrong!',500));
    }
},
deleteUser:async(req,res,next)=>{
    try {
        const user=await User.findById(req.params.id);
        if(!user)
        return res.status(500).json({
            message:"this user is not found !"
        });
        const filePath=user.avatar;
        await fsunlink(filePath);
        await User.findByIdAndDelete(user._id);
        res.json({
            message:"the user is deleted.."
        })
    } catch (error) {
        console.log(error);
        return next(new appError('somthing went wrong!',500));
    }
    
},
getVerificationCode:async(req,res,next)=>{
    try {
        //add an email 
        const email=req.body.email;
        //making the verification code
        let min = 1000;
        let max = 9999;
        let randomFourDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        //send the verification code
        EmailCtrl.sendVerificationCode(email,randomFourDigitNumber);
        req.user.verificationToken=randomFourDigitNumber;
        await req.user.save();
        res.status(200).json({
            message:'we sent the Verification Code successfully '
        })
    } catch (error) {
        console.log(error);
        return next(new appError('somthing went wrong!',500));
    }
},
verifyAcc:async(req,res,next)=>{ 
    try {
        const verificationToken=req.body.verificationToken;
        //if true send and true response 
        if(!req.user.verificationToken==verificationToken){
            return next (new appError('somthing went wrong!',500));
        }
        req.user.verified=true;
        req.user.verificationToken=null;
        await req.user.save();
        res.status(200).json({
            message:'the account has been verafied successfully..'
        })
    } catch (error) {
        console.log(error);
        return next(new appError('somthing went wrong!',500));
    }
},
forgetPassword:async(req,res,next)=>{
    try {
        //1)GET user email and chick on it 
        const email=req.body.email;
        const user=await User.findOne({email});
        if(!user){
            return next(new appError('This user is not found!',404));
        }
        //2) Generat the rest token 
        const resetToken=user.createRestToken();
        await user.save();
        //3) seneding the email
        const restUrl=`${req.get('host')}/api/user/resetPassword/${resetToken}`
        EmailCtrl.sendrestPassEmail(
            "password Reset , Your password reset token (valid for only 10 minutes)"
        ,restUrl,user);
    

        res.status(200).json({
            message:'the email is sent...'
        })
    } catch (err) {
    console.log(err);
    }
},
resetPassword:async(req,res,next)=>{
    try {
        const hashedToken=crypto.
    createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({
        passwordRestToken:hashedToken,
        passwordRestExpires:{$gte:Date.now()}
    });
        if(!user){
        return next(new appError('Token is invalid or has expired',400));
    }
    //logic to reset the password ....
    const password=req.body.password;
    const passwordConfirm=req.body.passwordConfirm;
    if(password!==passwordConfirm){
        return next(new appError('passwords are not the same',400));
    }
    user.password=password;
    user.passwordRestToken=undefined;
    user.passwordRestExpires=undefined;
    await user.save();
    const token=signToken(user._id);
    createCookie(token,res);
    res.status(200).json({
        message:'the usere is updated..',
        token
    })
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
    
},
updatePassword:async(req,res,next)=>{
    try {
        //check on the old password first
        const oldPassword=req.body.oldPassword;
        const newPassword=req.body.newPassword;
        const passwordConfirm=req.body.passwordConfirm;

        //not true tell the user sorry  
        if(! await req.user.correctPassword(oldPassword,req.user.password)){
            return next (new appError('sorry the password is wrong!',400))
        }
        //if true update the passwrd
        if(newPassword!==passwordConfirm){
            return next(new appError('sorry passwords are not the same!',400))
        }
        req.user.password=newPassword;
        await req.user.save();
        res.status(200).json({
            message:'the password is updated successfully..'
        });
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
},
updateMe:async(req,res,next)=>{
    try {
    if(req.body.password)
    return(next (new appError(`This route is not for password updates. Please use : ${req.protocol}://${req.get('host')}/api/user/updatePassword`,404)));
    
    const filteredBody=filterBody(req.body,"name","email","phone");
    if(req.file){
        if(req.user.avatar!=""){
            await fsunlink(req.user.avatar);
        }
        filteredBody.avatar=req.file.path;
    }
    //console.log(filteredBody);
    const newUser=await User.findOneAndUpdate(req.user._id,filteredBody,{new:true});
    res.status(200).json({
        message:'success',
        newUser
    });
} catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
},
deleteMe:async(req,res,next)=>{
    try {
        await User.findByIdAndDelete(req.user._id);
        res.status(203).json({
            message:'the user is deleted'
        });
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
},

addToCart:async(req,res,next)=>{
    try {
        const {productId,quantity}=req.body;
    //check if product exist and the quantity is available 
    const product=await Product.findById(productId);
    if(!product)
        return next(new appError('sorry this product is not exist right now!',404))
    if(quantity>product.quantity){
        return next(new appError('sorry the quantity  what u want is not exist right now!',404));
        }
    //add the product
    let flag=false;
    const array=req.user.cart.products.map(el=>{
        if(el.product==productId){
            return flag=true;
        }
    });
    if(flag)
        return next(new appError('sorry this product is already exist in the cart!',404))
    
    req.user.cart.products.push({product:productId,quantity:quantity});
    await req.user.save();
    res.status(200).json({
        message:'the item is added to the cart',
        cart:req.user.cart
    });
    } catch (error) {
        console.log(error);
        next(new appError('something went wrong!',500));
    }
    
},

UpdateCartItem:async(req,res,next)=>{
    try{
    const productId=req.params.productId;
    const quantity=req.body.quantity;
    const userCart=await User.findById(req.user._id).select('cart').populate('cart.products.product');
    let flag=false;
    const array=userCart.cart.products.map(el=>{
        if(el.product._id==productId){
            flag=true;
        }
    });
    if(!flag){
        return next(new appError('sorry this product is not exist in the cart!',404));
    }
    const product=await Product.findById(productId);
    if(!product||product.quantity<quantity){
        return next(new appError('sorry this product is not exist or the quantity is more than the available!',400));
        
    }
    const array2=userCart.cart.products.map(el=>{
        if(el.product._id==productId){
            el.quantity=quantity;
        }
        return el;

    });
    req.user.cart.products=array2;
    await req.user.save();
    res.status(200).json({
        message:'the item is updated',
        Cart:req.user.cart
    });
    }catch(error){
        console.log(error);
        next(new appError('something went wrong!',500));
    }
},
getCartItem:async(req,res,next)=>{
    try {
    const productId=req.params.productId;
    const product=await Product.findById(productId).select('-quantity -__v -admin_created_id');

    if(!product)
        return next(new appError('sorry this product is no longer exist!',404))
    
    let flag=false;
    let quantity=0;
    const array=req.user.cart.products.map(el=>{
        if(el.product==productId){
            flag=true;
            quantity=el.quantity;
        }
    });
    if(!flag)
        return next(new appError('sorry this product is not exist in the cart!',404))
    
    let CartOftheUser={};
    CartOftheUser.product=product;
    CartOftheUser.quantity=quantity;

    res.status(200).json({
        product:CartOftheUser 
    });

    } catch (error) {
        console.log(error);
        next(new appError('something went wrong!',500));
    }
},
getAllCartItems:async(req,res,next)=>{
    try{
    const userCart=await User.findById(req.user._id).select('cart').populate('cart.products.product');
        res.status(200).json({
            userCart:userCart.cart
        });
    }catch(error){
        console.log(error)
        next(new appError('something went wrong!',500))
    }
},
removeCartItem:async(req,res,next)=>{
    try{
        const productId=req.params.productId;
        const userCart=await User.findById(req.user._id).select('cart').populate('cart.products.product');
        let flag=false;
        if(userCart.cart.products.length==0){
            return next(new appError('sorry the cart is empty!',404));
        }
        const array=userCart.cart.products.map(el=>{
            if(el.product._id==productId){
                flag=true;
            }
        });
        if(!flag){
            return next(new appError('sorry this product is not exist in the cart!',404));
        }
        userCart.cart.products=userCart.cart.products.filter(el=>{
            return el.product._id!=productId
        });
        req.user.cart.products=userCart.cart.products;
        await req.user.save();
        res.status(204).json({
            message:'the item is deleted..',
        });
    }catch(error){
        console.log(error)
        next(new appError('something went wrong!',500))
    }
    
},
emptyTheCart:async(req,res,next)=>{
    try {
        const user=await User.findById(req.user._id);
        user.cart.products=[];
        await user.save();
        res.status(200).json({
            message:"the cart is empty"
        })
    } catch (error) {
        console.log(error);
        return next(new appError('something went wrong!',500));
    }
},
addFavItem:async(req,res,next)=>{
    try{
        const productId=req.params.productId;

        const userFavItems=await User.findById(req.user._id).select('favorite_items')
        let flag=false;
        const array=userFavItems.favorite_items.products.map(el=>{
            if(el.product==productId){
                return flag=true;
            }
        })
        if(flag)
            return next(new appError('sorry this product is already exist in the favorite_items!',404))
        req.user.favorite_items.products.push({product:productId});
        await req.user.save();
        res.status(200).json({
        message:'the item is added to the favorite items',
        favorite_items:req.user.favorite_items.products
    });
    }
    catch(error){
        console.log(error)
        next(new appError('something went wrong!',500))
    }
},
removeFavItem:async(req,res,next)=>{
    try{
        const productId=req.params.productId;
        const userCart=await User.findById(req.user._id).select('favorite_items').populate('favorite_items.products.product');
        let flag=false;
        if(userCart.favorite_items.products.length==0){
            return next(new appError('sorry the favorite_items is empty!',404));
        }
        const array=userCart.favorite_items.products.map(el=>{
            if(el.product._id==productId){
                flag=true;
            }
        });
        if(!flag){
            return next(new appError('sorry this product is not exist in the favorite_items!',404));
        }
        userCart.favorite_items.products=userCart.favorite_items.products.filter(el=>{
            return el.product._id!=productId
        });
        req.user.favorite_items.products=userCart.favorite_items.products;
        await req.user.save();
        res.status(204).json({
            message:'the item is deleted..',
        });
    }
    catch(error){
        console.log(error)
        next(new appError('something went wrong!',500))
    }
},
getAllFavoriteItems:async(req,res,next)=>{
    try{
    const userCart=await User.findById(req.user._id).select('favorite_items').populate('favorite_items.products.product');
        res.status(200).json({
            favorite_items:userCart.favorite_items
        });
    }catch(error){
        console.log(error)
        next(new appError('something went wrong!',500))
    }
},
}

module.exports=userCtrl
