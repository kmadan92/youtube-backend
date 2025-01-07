import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { CLOUDINARY_CLOUD_NAME } from '../constants.js';

dotenv.config({path:'./.env'})

//Configuration
    cloudinary.config({ 
        cloud_name: `${CLOUDINARY_CLOUD_NAME}`, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    })


// Upload an image
const uploadResult = async function(localFilePath){

    try{

        if(!localFilePath) return null

        const uploadResponse = await cloudinary.uploader
        .upload(
            localFilePath, {
                resource_type: "auto"
            }
        )

        fs.unlinkSync(localFilePath) // remove file from local path after cloud upload

        return uploadResponse

    }catch(error){

           fs.unlinkSync(localFilePath) // remove file from local path if error occurs
        
           //console.log(error)
            return null

    }

}

export {uploadResult}