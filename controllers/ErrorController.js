
module.exports=((err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status||'error';
    //when the id is not an mongoId like www
    if(err.name=='CastError'){
        err.message=`INVALID ${err.path}:${err.value} !`
    }
    if(process.env.NODE_ENV=='development')
        return sendDev(err,res);
    if(process.env.NODE_ENV=='production')
        sendProd(err,res);
});

const sendDev=(err,res)=>{
    return res.status(err.statusCode).json({
        status:err.status,
        Error:err,
        message:err.message,
        stack:err.stack
    });
}
const sendProd=(err,res)=>{
    return res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    });
}