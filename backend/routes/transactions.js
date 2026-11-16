const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Member = require('../models/Member');
const { auth } = require('../middleware/auth');

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const { status, memberId, bookId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (memberId) query.member = memberId;
    if (bookId) query.book = bookId;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('book', 'title author isbn coverImage')
      .populate('member', 'name memberId email')
      .populate('issuedBy', 'name')
      .populate('returnedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ transactions, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issue a book
router.post('/issue', auth, async (req, res) => {
  try {
    const { bookId, memberId, dueDate, notes } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.status !== 'Active') return res.status(400).json({ message: 'Member account is not active' });

    // Check max books limit (5 for premium, 3 for standard, 2 for student)
    const maxBooks = member.membershipType === 'Premium' ? 5 : member.membershipType === 'Standard' ? 3 : 2;
    if (member.booksCheckedOut >= maxBooks) {
      return res.status(400).json({ message: `Member has reached maximum book limit (${maxBooks})` });
    }

    const transaction = await Transaction.create({
      book: bookId,
      member: memberId,
      issuedBy: req.user._id,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default
      notes
    });

    // Update book and member
    book.availableCopies -= 1;
    await book.save();
    member.booksCheckedOut += 1;
    await member.save();

    const populated = await Transaction.findById(transaction._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name memberId email')
      .populate('issuedBy', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Return a book
router.put('/:id/return', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status === 'Returned') return res.status(400).json({ message: 'Book already returned' });

    const returnDate = new Date();
    transaction.returnDate = returnDate;
    transaction.returnedTo = req.user._id;
    transaction.status = 'Returned';

    // Calculate fine
    const fine = transaction.calculateFine();
    transaction.fineAmount = fine;
    if (req.body.finePaid) transaction.finePaid = true;

    await transaction.save();

    // Update book and member
    const book = await Book.findById(transaction.book);
    if (book) { book.availableCopies += 1; await book.save(); }

    const member = await Member.findById(transaction.member);
    if (member) {
      member.booksCheckedOut = Math.max(0, member.booksCheckedOut - 1);
      if (fine > 0) member.totalFines += fine;
      if (req.body.finePaid && fine > 0) member.paidFines += fine;
      await member.save();
    }

    const populated = await Transaction.findById(transaction._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name memberId email')
      .populate('issuedBy', 'name')
      .populate('returnedTo', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update overdue status (run periodically)
router.put('/update-overdue', auth, async (req, res) => {
  try {
    const result = await Transaction.updateMany(
      { status: 'Issued', dueDate: { $lt: new Date() } },
      { status: 'Overdue' }
    );
    res.json({ message: `${result.modifiedCount} transactions marked as overdue` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
