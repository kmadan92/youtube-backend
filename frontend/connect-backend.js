import dotenv from 'dotenv'
dotenv.config({path:'./../.env'})
 
const port = process.env.PORT
console.log(port)
 
    const res = await fetch("http://localhost:"+port+"/api/v1/test").then((response) => {
       return response.json()
    })
    .then((data) => {
        return data
    }).
    catch((error) => {
        console.log(error)
    })
 
    console.log(res)