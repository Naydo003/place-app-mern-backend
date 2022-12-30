const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');     // this excludes the password from the find() result
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({ getters: true }))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
  
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }
  
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)

  } catch (err) {
    const error = new HttpError('Could not create user, please try again', 500)
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,            // Note we never store image files on db because it will slow it down. Can use cloudinary if like (see YelpCamp). 'http://localhost:5000/' +  not wanted as we will add it on front end too.
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  let token
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },     // up to us what data we want to store in the token
      "super secret don't share", 
      { expiresIn: '1h' })                     // shorter expiry increased security, less time to hackers to use found webtoken
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)

  } catch (err) {
    const error = new HttpError('Something went wrong. Could not log you in', 500)
    return next(error)
  }

  if (isValidPassword === false) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },     // up to us what data we want to store in the token
      process.env.JWT_KEY, 
      { expiresIn: '1h' })                     // shorter expiry increased security, less time to hackers to use found webtoken
  } catch (err) {
    const error = new HttpError(
      'Login failed, please try again.',
      500
    );
    return next(error);
  }

  res.json({ userId: existingUser.id, email: existingUser.email, token: token });    // returns back the userId for use in auth
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
