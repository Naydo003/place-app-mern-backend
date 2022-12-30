const jwt = require('jsonwebtoken')

const HttpError = require("../models/http-error")



module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {               // When request with token attached the browser will send a req with method 'OPTIONS' to see if options are allowed and then persist with the POST, GET or whatever
    return next()
  }

  try {
    // need to send in headers because not all reqests will have a body. Could use query strings in Url but makes url messy.
    // Need to allow authorisation header (see app.js)    
    const token = req.headers.authorization.split(' ')[1]        // Note the object is authorisation: 'Bearer TOKEN' and we just need to split to separate the token
    
    if(!token) {
      throw new Error('Authentication failed no token')          // 
    }
    // the decodedToken will carry the userId and email as set during token generation in users-controllers
    const decodedToken = jwt.verify(token, process.env.JWT_KEY)     // must be the same secret key as token generation in users-controllers.js
    req.userData = { userId: decodedToken.userId }      // makes it available on req object, could add email here too
    next()
  } catch (err){
    const error = new HttpError('Authorisation Failed', 403)
    return next(error)
  }

}