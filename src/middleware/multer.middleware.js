import multer from 'multer'

// docs - https://github.com/expressjs/multer
// Strategy: user -> local storage (through multer) -> cloudinary
/*
----basic multer usage-----
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})
  */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.filename + '_' + uniqueSuffix)
    }
  })
  
  export const upload = multer({ storage: storage })