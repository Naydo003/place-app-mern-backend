const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload')

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),        // the single() method is the multer middleware function which will extract a file from request body under a key of 'image'. What we do with this file is handled in file-upload.js
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check('password').isLength({ min: 6 })     // make sure this number (ie 6) matches validation in front end
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
