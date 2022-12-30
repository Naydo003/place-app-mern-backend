const express = require('express');
const fs = require('fs')                   // file system module is a node core module, allows us to interact with files and delete them 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());


// This middleware intercepts any image file requests and serves up the file. Note that requests themselves cannot access or see folders/files, a middleware must be made to serve them.
// like route, this filters any request that start with localhost:5000/uploads/images
// static(<file location>) will return a middleware that responds with just a file. Static serving just returns a file, does not execute it.
// path.join() is making an absolute path to the uploads/images folder

// app.use('uploads/images', express.static(path.join('uploads', 'images')))    // old mate did this but path join seems unnecessary
app.use('/uploads/images', express.static('uploads/images'))     // ie any url with /uploads/images will have access to files in static('uploads/images') folder

// sets a header in response such that it wont trigger Cross Origin Resourse Sharing (CORS) errors
// Basically frontend is on a different domain so browser will by default block data coming from outside domian without the following adjustments.
// Because CORS policy enforced by browser the reqest goes through from frontend to server however the response is blocked when it comes back to browser without appropriate headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')   // * opens this up to any domain, we could restrict it to localhost:3000
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Content-Type, Authorization') // First three set automatically, last two we manually define. Authorisation must be spelled with a z for jwt to work
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {      // unlink deletes the file at that path
      console.log(err)                    // No error handling, if error not the worst, we can just manually delete the file
    })
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});


mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oae2wcf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(5000);
    console.log("DB connected & listening on port 5000")
  })
  .catch(err => {
    console.log(err);
  });

