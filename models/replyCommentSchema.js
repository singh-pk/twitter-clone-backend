const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const replyCommentSchema = new mongoose.Schema({
  commentId: { type: ObjectId, ref: 'Comment' },
  replies: [
    {
      repliedBy: {
        name: { type: String },
        _id: { type: ObjectId, ref: 'User' },
      },
      repliedTo: {
        name: { type: String },
        _id: { type: ObjectId, ref: 'User' },
      },
      created: { type: Date, default: Date.now() },
      reply: { type: String },
      likes: [{ type: ObjectId, ref: 'User' }],
    },
  ],
});

module.exports = mongoose.model('Reply', replyCommentSchema);
