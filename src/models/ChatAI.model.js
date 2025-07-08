const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatAISchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {timestamps: true});

const ChatAI = mongoose.model('ChatAI', chatAISchema);

module.exports = ChatAI;
