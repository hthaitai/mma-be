const mongoose = require('mongoose');
const { Schema } = mongoose;

const knowledgeBaseSchema = new Schema({
  intent: {
    type: String,
    required: true,
    unique: true,
  },
  response_template: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
},{timestamps: true});

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

module.exports = KnowledgeBase;
