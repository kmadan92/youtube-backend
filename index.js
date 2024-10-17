import dotenv from 'dotenv'
import express from 'express'

dotenv.config()
const app = express()

app.get('/', (req, res) => {
  res.send('Welcome to exploring backend!!')
})

app.get('/api/v1/test', (req, res) => {
 
  res.send(
    {
        "id":1,
        "name":"kapil",
        "number":8878717007,
        "city":"Bengaluru"
    }
  )
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})