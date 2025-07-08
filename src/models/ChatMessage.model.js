const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema({
  chat_id: {
    type: Schema.Types.ObjectId,
    ref: 'ChatAI',
    required: true,
  },
  sender_type: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
},{timestamps: true});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
