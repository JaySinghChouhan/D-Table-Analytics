const mongoose = require('mongoose');

const punchSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    selfie: { type: String, required: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    punchIn: {
      type: punchSchema,
      required: true,
    },
    punchOut: {
      type: punchSchema,
      default: null,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    shiftStatus: {
      type: String,
      enum: ['incomplete', 'completed'],
      default: 'incomplete',
    },
    validationStatus: {
      type: String,
      enum: ['pending', 'valid', 'invalid'],
      default: 'pending',
    },
    validationRemarks: {
      type: String,
      default: '',
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    overtimeStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    overtimeRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OvertimeRequest',
      default: null,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
