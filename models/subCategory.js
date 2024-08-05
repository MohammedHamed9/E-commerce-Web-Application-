const mongoose=require('mongoose');
const subCategorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"the subCategory name can't be empty"],
        trim:true,
        unique:[true,"the subCategory must be unique"],
        minlength:[3,"the subCategory name can't be less than or equal to 3 character"]
    },
    slug:{
        type:String,
        trim:true,
        lowercase:true
    },
    category:{
        type:mongoose.Schema.ObjectId,
        ref:'categories',
        required:[true,"the subCategory must has a category"],
    }

},{timestamps:true});
module.exports=mongoose.model('subCategories',subCategorySchema);