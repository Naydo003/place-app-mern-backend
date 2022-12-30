const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')   // is actually a bunch of middlewares which we can access like methods.
const checkAuth = require('../middleware/check-auth')

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);


// Authorisation middleware function.
// Any routes below this middleware will use the middleware and need authorisation
// routes above this line will not use middleware
router.use(checkAuth)

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')                                // these are express-validator methods called as middleware, error handling done in controller
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
