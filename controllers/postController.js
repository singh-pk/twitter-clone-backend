const Post = require('../models/postSchema');
const User = require('../models/userSchema');
const Comment = require('../models/commentSchema');
const Reply = require('../models/replyCommentSchema');
const formidable = require('formidable');
const fs = require('fs');

exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate('postedBy', '_id name')
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({ error: 'Post not found' });
      }
      req.post = post;
      next();
    });
};

exports.getPosts = (_, res) =>
  Post.find()
    .populate('postedBy', '_id name')
    .select('_id title body')
    .then((posts) => res.json({ posts }))
    .catch((err) => res.status(500).json({ error: err }));

exports.createPost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    let post = new Post(fields);
    req.profile.salt = undefined;
    req.profile.hashed_password = undefined;
    req.profile.__v = undefined;
    post.postedBy = req.profile;
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }

    post.save((err, result) => {
      if (err) return res.status(400).json({ error: err });

      const { name } = result.postedBy;
      const { body, photo, createdAt } = result;

      return res.json({ body, photo, name, createdAt });
    });
  });
};

exports.postByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate('postedBy', '_id name')
    .select('_id body likes createdAt updatedAt')
    .sort('-createdAt')
    .exec((err, posts) => {
      if (err) return res.status(400).json({ error: err });

      return res.json(posts);
    });
};

exports.getPostById = (req, res) => res.json(req.post);

exports.isPoster = (req, res, next) => {
  const poster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  if (!poster) return res.status(403).json({ error: 'Unauthorized user' });
  next();
};

exports.updatePost = (req, res) => {
  let post = req.post;
  post = Object.assign(post, req.body);
  post.updatedAt = Date.now();
  post.save((err) => {
    if (err) return res.status(400).json({ error: 'Unauthorized user' });
    return res.json({ message: 'Post updated' });
  });
};

exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((err) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: 'Post deleted' });
  });
};

exports.postByFollowing = (req, res) =>
  Post.find({ postedBy: { $in: req.profile.following } })
    .populate('postedBy', '_id name')
    .sort('-createdAt')
    .exec((err, posts) => {
      if (err) return res.status(400).json({ error: err });

      return res.json(posts);
    });

exports.getPostPhoto = (req, res) => {
  if (req.post.photo.data) {
    res.set('Content-Type', req.post.photo.contentType);
    return res.send(req.post.photo.data);
  }
  return res.status(400).json({ error: 'No image found' });
};

exports.likePost = (req, res, next) =>
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });

      next();
    }
  );

exports.addPostToUserLikes = (req, res) =>
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { likes: req.body.postId } },
    { new: true }
  ).exec((err) => {
    if (err) return res.status(400).json({ error: err });

    return res.json({ success: true });
  });

exports.unlikePost = (req, res, next) =>
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });

      next();
    }
  );

exports.removePostFromUserLikes = (req, res) =>
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { likes: req.body.postId } },
    { new: true }
  ).exec((err) => {
    if (err) return res.status(400).json({ error: err });

    return res.json({ success: true });
  });

exports.getComments = (req, res) => {
  Comment.findOne({ postId: req.post._id })
    .sort('-created')
    .exec((err, result) => {
      if (err) return res.status(400).json({ error: err });

      return res.json(result);
    });
};

exports.createComment = (req, res) => {
  Comment.findOne({ postId: req.post._id }, (err, comments) => {
    if (err) return res.status(400).json({ error: err });

    if (!comments) {
      const comment = new Comment({
        postId: req.post._id,
        comments: {
          comment: req.body.comment,
          commentedBy: { name: req.profile.name, _id: req.profile._id },
          created: Date.now(),
        },
      });

      comment.save((err, result) => {
        if (err) return res.status(400).json({ error: err });

        return res.json(result);
      });
    } else {
      comments.updateOne(
        {
          $push: {
            comments: {
              comment: req.body.comment,
              commentedBy: { name: req.profile.name, _id: req.profile._id },
              created: Date.now(),
            },
          },
        },
        (err, result) => {
          if (err) return res.status(400).json({ error: err });

          return res.json(result);
        }
      );
    }
  });
};

exports.likeComment = (req, res, next) =>
  Comment.updateOne(
    {
      postId: req.body.postId,
      'comments._id': req.body.commentId,
    },
    { $push: { 'comments.$.likes': req.body.userId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });

      next();
    }
  );

exports.addCommentToUserLikes = (req, res) =>
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { likes: req.body.commentId } },
    { new: true }
  ).exec((err) => {
    if (err) return res.status(400).json({ error: err });

    return res.json({ success: true });
  });

exports.unlikeComment = (req, res, next) =>
  Comment.updateOne(
    {
      postId: req.body.postId,
      'comments._id': req.body.commentId,
    },
    { $pull: { 'comments.$.likes': req.body.userId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });

      next();
    }
  );

exports.removeCommentFromUserLikes = (req, res) =>
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { likes: req.body.commentId } },
    { new: true }
  ).exec((err) => {
    if (err) return res.status(400).json({ error: err });

    return res.json({ success: true });
  });

exports.getReplies = (req, res) => {
  Reply.findOne({ commentId: req.params.commentId })
    .sort('-created')
    .exec((err, result) => {
      if (err) return res.status(400).json({ error: err });

      return res.json(result);
    });
};

exports.createReply = (req, res) => {
  Reply.findOne({ commentId: req.body.commentId }, (err, replies) => {
    if (err) return res.status(400).json({ error: err });

    if (!replies) {
      const reply = new Reply({
        commentId: req.body.commentId,
        replies: {
          reply: req.body.reply,
          repliedBy: { name: req.profile.name, _id: req.profile._id },
          repliedTo: { name: req.body.name, _id: req.body._id },
          created: Date.now(),
        },
      });

      reply.save((err, result) => {
        if (err) return res.status(400).json({ error: err });

        return res.json(result);
      });
    } else {
      replies.updateOne(
        {
          $push: {
            replies: {
              reply: req.body.reply,
              repliedBy: { name: req.profile.name, _id: req.profile._id },
              repliedTo: { name: req.body.name, _id: req.body._id },
              created: Date.now(),
            },
          },
        },
        (err, result) => {
          if (err) return res.status(400).json({ error: err });

          return res.json(result);
        }
      );
    }
  });
};

exports.likeReply = (req, res, next) =>
  Reply.updateOne(
    {
      commentId: req.body.commentId,
      'replies._id': req.body.replyId,
    },
    { $push: { 'replies.$.likes': req.body.userId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });

      next();
    }
  );

exports.addReplyToUserLikes = (req, res) =>
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { likes: req.body.replyId } },
    { new: true }
  ).exec((err) => {
    if (err) return res.status(400).json({ error: err });

    return res.json({ success: true });
  });

exports.unlikeReply = (req, res, next) =>
  Reply.updateOne(
    {
      commentId: req.body.commentId,
      'replies._id': req.body.replyId,
    },
    { $pull: { 'replies.$.likes': req.body.userId } },
    (err) => {
      if (err) return res.status(400).json({ error: err });

      next();
    }
  );

exports.removeReplyFromUserLikes = (req, res) =>
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { likes: req.body.replyId } },
    { new: true }
  ).exec((err) => {
    if (err) return res.status(400).json({ error: err });

    return res.json({ success: true });
  });
