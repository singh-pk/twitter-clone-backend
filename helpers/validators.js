const { body, validationResult } = require('express-validator');

const createPostValidation = [
  body('body', 'Body is required')
    .notEmpty()
    .isLength({ min: 4, max: 2000 })
    .withMessage('Body must be between 4 to 2000 characters'),
];

const signUpValidation = [
  body('name', 'Name is required')
    .notEmpty()
    .isLength({ min: 2, max: 15 })
    .withMessage('Name must be between 2 to 15 characters'),

  body('email', 'Email is required')
    .notEmpty()
    .matches(/.+\@.+\..+/)
    .withMessage('Please enter a valid email'),

  body('password', 'Password is required')
    .notEmpty()
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

const resetPasswordValidation = [
  body('password', 'Password is required')
    .notEmpty()
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({ error: firstError });
  }
  return next();
};

module.exports = {
  createPostValidation,
  signUpValidation,
  resetPasswordValidation,
  validate,
};
