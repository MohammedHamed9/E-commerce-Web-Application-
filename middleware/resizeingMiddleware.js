const sharp=require('sharp');
exports.resizeingImage=(foldername,width,hieght)=>{
    return async (req,res,next)=>{
        //if theres not photo skip
        if(!req.file && !req.files) return next();
    
        //specifing the filename
        if(req.file){
            req.file.filename=`${Date.now()}-${req.file.originalname}`.replace(/\s/g,'-');
            req.file.path=`uploads/${foldername}/${req.file.filename}`;
            //resizeing
            await sharp(req.file.buffer)
            .resize(width,hieght)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`uploads/${foldername}/${req.file.filename}`)
            return next();
        }
        if(req.files.image_cover){
            const imageCoverName=`${Date.now()}-${req.files.image_cover[0].originalname}`.replace(/\s/g,'-');
            const filePath=`uploads/${foldername}/${imageCoverName}`;
            await sharp(req.files.image_cover[0].buffer)
            .resize(width,hieght)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(filePath)
            req.body.image_cover=filePath;
        }
        if(req.files.product_images){
            req.files.product_images.map(async (el,index)=>{
                const imageName=`${Date.now()}-${index+1}-${el.originalname}`.replace(/\s/g,'-');
                const filePath=`uploads/${foldername}/${imageName}`;
                await sharp(el.buffer)
                .resize(width,hieght)
                .toFormat('jpeg')
                .jpeg({quality:90})
                .toFile(filePath)
                
                })
            next()
        }
    }
}
