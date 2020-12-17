const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema({
  postId: { type: ObjectId, ref: 'Post' },
  comments: [
    {
      commentedBy: {
        name: { type: String },
        _id: { type: ObjectId, ref: 'User' },
      },
      created: { type: Date, default: Date.now() },
      comment: { type: String },
      likes: [{ type: ObjectId, ref: 'User' }],
    },
  ],
});

module.exports = mongoose.model('Comment', commentSchema);
