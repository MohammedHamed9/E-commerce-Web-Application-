const multer=require("multer");

const storage=multer.diskStorage({
    destination:'uploads/products',
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`.replace(/\s/g,'-'));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jfif') {
        // If the file type is not JPEG or PNG, reject the file
        return cb(new Error('The image type is wrong!'), false);
    } else if (file.size > 4*1024) {
        // If the file size is larger than 4 MB, reject the file
        return cb(new Error('The image size is too large!'), false);
    }
    // If the file passes all checks, accept the file
    cb(null, true);
};
const upload=multer({storage,fileFilter});
module.exports.upload=upload;