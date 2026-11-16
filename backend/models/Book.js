const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Children', 'Romance', 'Mystery', 'Self-Help', 'Other']
  },
  publisher: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  availableCopies: {
    type: Number,
    min: 0,
    default: 1
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number
  },
  location: {
    shelf: String,
    row: String
  }
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);
