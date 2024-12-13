import dotenv from 'dotenv'
import express from 'express'
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config({path:'./.env'})
const app = express()

//define cors origin - defined in .env - to be changed to frontend deployment
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

//request size limit
app.use(express.json({limit: "25kb"}));

//request through url
app.use(express.urlencoded({extended: true, limit: "25kb"}));

//store non-raw data to public folder
app.use(express.static("public"))

//allow read-write cookies to client
app.use(cookieParser())

// import routes
import routerUser from "./routes/users.routes.js"

//declare routes
app.use("/api/users",routerUser)

export {app}