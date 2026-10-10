import mongoose from 'mongoose';
import { ComplaintStatuses } from '../utils/constants.js';

const statusLogSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true
    },
    fromStatus: {
      type: String,
      enum: Object.values(ComplaintStatuses),
      default: ComplaintStatuses.RECEIVED
    },
    toStatus: {
      type: String,
      enum: Object.values(ComplaintStatuses),
      required: true
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actorRole: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      trim: true,
      default: 'system'
    }
  },
  { timestamps: true }
);

const StatusLog = mongoose.model('StatusLog', statusLogSchema);

export default StatusLog;