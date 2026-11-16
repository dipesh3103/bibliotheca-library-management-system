
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true }
    },

    membershipType: {
      type: String,
      enum: ['Standard', 'Premium', 'Student'],
      default: 'Standard'
    },

    membershipStart: {
      type: Date,
      default: Date.now
    },

    membershipEnd: {
      type: Date
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    },

    booksCheckedOut: {
      type: Number,
      default: 0,
      min: 0
    },

    totalFines: {
      type: Number,
      default: 0,
      min: 0
    },

    paidFines: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Generate member ID before validation
memberSchema.pre('validate', async function () {
  if (!this.memberId) {
    const Counter = mongoose.model('Member');

    // Generate a candidate ID and retry if it already exists.
    let candidate;
    let exists = true;

    while (exists) {
      const count = await Counter.countDocuments();
      candidate = `LIB${String(count + 1).padStart(5, '0')}`;

      exists = await Counter.exists({ memberId: candidate });
    }

    this.memberId = candidate;
  }

  // Set membership end date to one year after start date.
  if (!this.membershipEnd) {
    const startDate = this.membershipStart || new Date();
    const endDate = new Date(startDate);

    endDate.setFullYear(endDate.getFullYear() + 1);
    this.membershipEnd = endDate;
  }
});

module.exports = mongoose.model('Member', memberSchema);
