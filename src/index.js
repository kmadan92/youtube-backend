import dotenv from 'dotenv'
import express from 'express'
import connectDB from './db/db-config.js'
import { APP_NAME } from './constants.js'
import {app} from "./app.js"

dotenv.config({path:'./.env'})
const port = process.env.PORT

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Error connecting to app.....")
    });

    app.listen(port, () => {
    console.log(`${APP_NAME} app listening on port ${process.env.PORT}`)
  });
})
.catch((error)=>{
    console.log("Error connecting DB:"+error)
})


