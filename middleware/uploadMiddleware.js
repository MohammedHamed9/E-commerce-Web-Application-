const multer=require("multer");
const appError=require('../utils/appError');

//------upload avatars--------
const storage=multer.memoryStorage();
/*multer.diskStorage({
    destination:'uploads/avatars',
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`.replace(/\s/g,'-'))
    }
});*/
const fileFilter = (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        // If the file type is not JPEG or PNG, reject the file
        return cb(new appError('Invalid image type !',400), false);
    } else if (file.size > 1*1024) {
        // If the file size is larger than 4 MB, reject the file
        return cb(new appError('Invalid image type size!',400), false);
    }
    // If the file passes all checks, accept the file
    cb(null, true);
};
const upload=multer({storage,fileFilter});
/*const upload = multer({
    storage: storage,
    limits: { fileSize:  1024 * 1024 } // Set file size limit to 10MB
  });*/
module.exports.upload=upload;

