const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Overdue', 'Lost'],
    default: 'Issued'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, { timestamps: true });

transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const count = await mongoose.model('Transaction').countDocuments();
    this.transactionId = `TXN${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

// Calculate fine (₹5 per day overdue)
transactionSchema.methods.calculateFine = function() {
  if (this.status === 'Returned' && this.returnDate > this.dueDate) {
    const days = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
    return days * 5;
  }
  if (this.status === 'Overdue' || (this.status === 'Issued' && new Date() > this.dueDate)) {
    const days = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    return days * 5;
  }
  return 0;
};

module.exports = mongoose.model('Transaction', transactionSchema);
