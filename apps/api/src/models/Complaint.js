import mongoose from 'mongoose';
import { ComplaintCategories, ComplaintStatuses, PriorityLevels } from '../utils/constants.js';

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      required: true
    },
    publicId: {
      type: String,
      trim: true,
      default: ''
    },
    originalName: {
      type: String,
      trim: true,
      default: ''
    },
    mimeType: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const triageSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      trim: true,
      default: ''
    },
    rawCategory: {
      type: String,
      trim: true,
      default: ''
    },
    rawDepartment: {
      type: String,
      trim: true,
      default: ''
    },
    rawPriority: {
      type: String,
      trim: true,
      default: ''
    },
    summary: {
      type: String,
      trim: true,
      default: ''
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    fallbackUsed: {
      type: Boolean,
      default: false
    },
    triagedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      unique: true,
      default: () => `CMP-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000
    },
    category: {
      type: String,
      enum: Object.values(ComplaintCategories),
      default: ComplaintCategories.OTHER
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    priority: {
      type: String,
      enum: Object.values(PriorityLevels),
      default: PriorityLevels.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatuses),
      default: ComplaintStatuses.RECEIVED,
      index: true
    },
    summary: {
      type: String,
      trim: true,
      default: ''
    },
    locationText: {
      type: String,
      trim: true,
      default: ''
    },
    geoLocation: {
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      },
      address: {
        type: String,
        trim: true,
        default: ''
      }
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    imageAttachment: {
      fileName: {
        type: String,
        trim: true,
        default: ''
      },
      mimeType: {
        type: String,
        trim: true,
        default: ''
      },
      size: {
        type: Number,
        default: 0
      },
      data: {
        type: String,
        default: ''
      }
    },
    imageVerified: {
      type: Boolean,
      default: false
    },
    imageVerification: {
      verified: {
        type: Boolean,
        default: false
      },
      confidence: {
        type: Number,
        default: 0
      },
      reason: {
        type: String,
        trim: true,
        default: ''
      },
      model: {
        type: String,
        trim: true,
        default: ''
      },
      verifiedAt: {
        type: Date,
        default: null
      }
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    aiTriage: {
      type: triageSchema,
      default: () => ({})
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    },
    dueAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

complaintSchema.index({ citizen: 1, createdAt: -1 });
complaintSchema.index({ department: 1, status: 1, priority: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;