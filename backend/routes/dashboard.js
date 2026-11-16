const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const [totalBooks, totalMembers, activeLoans, overdueLoans] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Transaction.countDocuments({ status: 'Issued' }),
      Transaction.countDocuments({ status: 'Overdue' })
    ]);

    const totalCopies = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }]);

    const recentTransactions = await Transaction.find()
      .populate('book', 'title author')
      .populate('member', 'name memberId')
      .sort({ createdAt: -1 })
      .limit(5);

    const categoryStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const monthlyTransactions = await Transaction.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    const totalFines = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: '$fineAmount' } } }]);

    res.json({
      totalBooks,
      totalMembers,
      activeLoans,
      overdueLoans,
      totalCopies: totalCopies[0] || { total: 0, available: 0 },
      recentTransactions,
      categoryStats,
      monthlyTransactions: monthlyTransactions.reverse(),
      totalFines: totalFines[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
