"use server"

import { UploadApiResponse, v2 as cloudinary } from "cloudinary"
import { actionClient } from "@/server/safe-action"
import z from "zod"
import axios from 'axios'

cloudinary.config({
  cloud_name: process.env.CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const recolorSchema = z.object({
  activeImage: z.string(),
  format: z.string(),
})

async function checkImageProcessing(url: string) {
  try {
    const response = await fetch(url);
    console.log(response)
    if (response.ok) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

export const bgRemoval = actionClient
  .schema(recolorSchema)
  .action(async ({ parsedInput: { activeImage, format } }) => {
    const form = activeImage.split(format);
    console.log(form)
    const pngConvert = form[0] + "jpg";
    const parts = pngConvert.split("/upload/");



    const removeUrl = `${parts[0]}/upload/e_background_removal/${parts[1]}`;

    // console.log(await axios.get(removeUrl,{ responseType: 'arraybuffer' }))

    axios.get(removeUrl, { responseType: 'arraybuffer' })
  .then(response => {
    // The response will contain the transformed image
    const imageBuffer = Buffer.from(response.data, 'binary');
    
    // You can save this buffer or use it as needed
    // For example, saving the image to a file using fs (if in Node.js)
    const fs = require('fs');
    fs.writeFileSync('transformed_image.png', imageBuffer);

    console.log('Background removed and image saved!');
  })
  .catch(error => {
    console.error('Error removing background:', error);
  });

    // Poll the URL to check if the image is processed
    let isProcessed = false
    const maxAttempts = 20
    const delay = 1000 // 1 second
    // isProcessed = await checkImageProcessing(removeUrl);
    // for (let attempt = 0; attempt < maxAttempts; attempt++) {
    //   isProcessed = await checkImageProcessing(removeUrl)
      
    //   if (isProcessed) {
    //     break
    //   }
    //   await new Promise((resolve) => setTimeout(resolve, delay))
    // }

    // console.log(isProcessed)
    // if (!isProcessed) {
    //   throw new Error("Image processing timed out")
    // }
    console.log(removeUrl)
    return { success: removeUrl }
  })
