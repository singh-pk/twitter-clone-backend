const router = require('express').Router();

const {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  socialLogin,
} = require('../controllers/authController');
const {
  signUpValidation,
  resetPasswordValidation,
  validate,
} = require('../helpers/validators');

router.post('/signup', signUpValidation, validate, signUp);
router.post('/signin', signIn);
router.get('/signout', signOut);
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', resetPasswordValidation, validate, resetPassword);
router.post('/social-login', socialLogin);

module.exports = router;
