const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { sendEmail } = require('../helpers/sendEmail');
require('dotenv').config();

exports.signUp = async (req, res) => {
  const userExists = await User.findOne({ email: req.body.email });
  const userNameExists = await User.findOne({ name: req.body.name });

  if (userExists) {
    return res.status(403).json({ error: 'Email is already present!' });
  }

  if (userNameExists) {
    return res.status(403).json({ error: 'User name already taken' });
  }

  const user = new User(req.body);
  await user.save();
  return res.json({ message: 'Sign Up successful' });
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(401)
        .json({ error: `User with that email doesn't exist` });
    }
    if (!user.authenticate(password)) {
      return res
        .status(401)
        .json({ error: `Email and password doesn't match` });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.cookie('t', token, { expire: new Date() + 9999 });

    const { _id, name, email, followers, following, likes } = user;
    let photoUrl = `http://localhost:8080/api/user/photo/${_id}?${new Date().getTime()}`;

    return res.json({
      token,
      user: { _id, email, name, photoUrl, followers, following, likes },
    });
  });
};

exports.signOut = (_, res) => {
  res.clearCookie('t');
  return res.json({ message: `Sign Out successful` });
};

exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'auth',
});

exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'No request body' });
  if (!req.body.email)
    return res.status(500).json({ error: 'No email provided' });

  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user)
      return res
        .status(401)
        .json({ error: 'User with that email does not exists' });

    const token = jwt.sign(
      { _id: user._id, iss: 'NODEAPI' },
      process.env.JWT_SECRET
    );

    const emailData = {
      from: 'noreply@node-react.com',
      to: email,
      subject: 'Password Reset Link',
      text: `Please use the following link to reset your password: ${`http://localhost:3000/reset-password/${token}`}`,
      html: `<p>Please use the following link to reset your password: </p> <p>${`http://localhost:3000/reset-password/${token}`}</p>`,
    };

    return user.updateOne({ resetPasswordLink: token }, (err) => {
      if (err) return res.status(400).json({ error: err });

      sendEmail(emailData);
      return res.json({
        message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
      });
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid Link' });

    const updateFields = {
      password: newPassword,
      resetPasswordLink: '',
    };

    user = Object.assign(user, updateFields);
    user.updated = Date.now();

    user.save((err) => {
      if (err) return res.status(400).json({ error: err });

      return res.json({ message: `Password updated!` });
    });
  });
};

exports.socialLogin = (req, res) =>
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user) {
      let user = new User(req.body);
      req.profile = user;
      user.save((err) => {
        if (err) return res.status(400).json({ error: err });
      });

      const token = jwt.sign(
        { _id: user._id, iss: 'NODEAPI' },
        process.env.JWT_SECRET
      );

      res.cookie('t', token, { expire: new Date() + 9999 });

      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
    } else {
      req.profile = user;
      user = Object.assign(user, req.body);
      user.updatedAt = Date.now();
      user.save((err) => {
        if (err) return res.status(400).json({ error: err });
      });

      const token = jwt.sign(
        { _id: user._id, iss: 'NODEAPI' },
        process.env.JWT_SECRET
      );

      res.cookie('t', token, { expire: new Date() + 9999 });

      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
    }
  });
