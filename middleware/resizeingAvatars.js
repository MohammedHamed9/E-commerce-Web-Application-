const sharp=require('sharp');
exports.resizeingAvatars=async (req,res,next)=>{
    //if theres not photo skip
    if(!req.file) return next();

    //specifing the filename
    req.file.filename=`${Date.now()}-${req.file.originalname}`.replace(/\s/g,'-');
    req.file.path=`uploads/avatars/${req.file.filename}`;
    //resizeing
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`uploads/avatars/${req.file.filename}`)
    next();
}