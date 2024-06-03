const mongoose=require("mongoose");
module.exports.connect=async(DB)=>{
  mongoose.connect(DB,{
    dbName: 'market'
  })
}
  
