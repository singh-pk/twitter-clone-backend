const User = require('../models/userSchema');
const formidable = require('formidable');
const fs = require('fs');

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });

    req.profile = user;
    next();
  });
};

exports.hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!authorized) return res.status(403).json({ error: 'Unauthorized user' });
  next();
};

exports.getAllUsers = (_, res) => {
  User.find((err, users) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ users });
  }).select('name email createdAt updatedAt');
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.hashed_password = undefined;
  req.profile.__v = undefined;
  res.json(req.profile);
};

exports.updateUser = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: err });

    let user = req.profile;
    user = Object.assign(user, fields);
    user.updatedAt = Date.now();

    if (files.photo) {
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }

    user.save((err, result) => {
      if (err) return res.status(400).json({ error: err });

      result.hashed_password = undefined;
      result.salt = undefined;
      result.__v = undefined;

      const { name, updatedAt } = result;

      return res.json({ name, updatedAt });
    });
  });
};

exports.userPhoto = (req, res) => {
  if (req.profile.photo.data) {
    res.set('Content-Type', req.profile.photo.contentType);
    return res.send(req.profile.photo.data);
  }
  return res.status(400).json({ error: 'Profile pic is not present' });
};

exports.deleteUser = (req, res) => {
  let user = req.profile;
  user.remove((err) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: 'User deleted' });
  });
};

exports.addFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { following: req.body.followId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });
    }
  );
  next();
};

exports.addFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) return res.status(400).json({ error: err });

    result.hashed_password = undefined;
    result.salt = undefined;
    result.__v = undefined;

    return res.json(result);
  });
};

exports.removeFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { following: req.body.unfollowId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });
    }
  );
  next();
};

exports.removeFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    { $pull: { followers: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) return res.status(400).json({ error: err });

    result.hashed_password = undefined;
    result.salt = undefined;
    result.__v = undefined;

    return res.json(result);
  });
};

exports.whoToFollow = (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  User.find({ _id: { $nin: following } }, (err, users) => {
    if (err) return res.status(400).error(err);

    return res.json({ users });
  }).select('name email');
};
