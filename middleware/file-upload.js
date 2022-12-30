const multer = require('multer')       // multer is a package for parsing multipart form data. ie files as well as text. JSON can only send text
const uuid = require('uuid/v1')        // this package was already installed for something else

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const fileUpload = multer({
  limits: 500000,                  // filesize in bytes (so this is 500kb)
  storage: multer.diskStorage({
    destination: (req, file, cb) => {                // is a function that takes the requsest object, the file that was extracted and a callback
      cb(null, 'uploads/images')
    },
    filename: (req, file, cb) => {           
      const ext = MIME_TYPE_MAP[file.mimetype]       // the file will carry a mimetype property in the format image/xxx
      cb(null, uuid() + '.' + ext)           // callback first arg is error, we should't have any. uuid() generates unique id so file name will be unique.ext
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]       // double bang !! operator converts the value to a true or false statement
    let error = isValid ? null : new Error('Invlid mime type!')
    cb(error, isValid)                                 // cb(error, boolean which determines if file upload proceeds)
  }


})

module.exports = fileUpload