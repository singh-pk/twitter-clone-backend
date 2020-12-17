const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const postScehma = new mongoose.Schema(
  {
    body: {
      type: String,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    likes: [{ type: ObjectId, ref: 'User' }],
    comments: [
      { comment: { type: String } },
      { commentedBy: { type: ObjectId, ref: 'User' } },
      { created: { type: Date, default: Date.now() } },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postScehma);
