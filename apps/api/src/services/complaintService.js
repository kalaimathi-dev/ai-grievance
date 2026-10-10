import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import StatusLog from '../models/StatusLog.js';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';
import { ComplaintStatuses, PriorityLevels, UserRoles } from '../utils/constants.js';
import { triageComplaint, verifyComplaintImage } from './triageService.js';
import { resolveDepartmentFromCategory } from './routingService.js';
import { createNotification } from './notificationService.js';

const populateComplaint = () => [
  { path: 'citizen', select: 'name email phone role department' },
  { path: 'department', select: 'code name description' },
  { path: 'assignedOfficer', select: 'name email phone role department' }
];

const normalizeDepartmentRef = async (triageResult, fallbackCategory, complaintText) => {
  if (triageResult?.department && triageResult.department._id) {
    return triageResult.department._id;
  }

  const resolvedDepartment = await resolveDepartmentFromCategory(fallbackCategory, complaintText);
  if (!resolvedDepartment) {
    return null;
  }

  if (resolvedDepartment._id) {
    return resolvedDepartment._id;
  }

  const departmentDocument = await Department.findOneAndUpdate(
    { code: resolvedDepartment.code },
    { $setOnInsert: resolvedDepartment },
    { upsert: true, new: true }
  );

  return departmentDocument._id;
};

export const createComplaint = async (payload, citizenId, imageFile = null) => {
  const { title, description, locationText = '', attachments = [], category = '' } = payload;

  if (!title || !description) {
    throw new HttpError(400, 'Title and description are required');
  }

  const aiResult = await triageComplaint(description);
  const complaintCategory = category || aiResult.category;
  const departmentId = await normalizeDepartmentRef(aiResult, complaintCategory, description);

  const imageVerification = imageFile
    ? await verifyComplaintImage({
        imageBuffer: imageFile.buffer,
        mimeType: imageFile.mimetype,
        complaintText: description,
        category: complaintCategory
      })
    : null;

  const imageAttachment = imageFile
    ? {
        fileName: imageFile.originalname,
        mimeType: imageFile.mimetype,
        size: imageFile.size,
        data: imageFile.buffer.toString('base64')
      }
    : null;

  const complaint = await Complaint.create({
    citizen: citizenId,
    createdBy: citizenId,
    title,
    description,
    category: complaintCategory,
    department: departmentId,
    priority: aiResult.priority || PriorityLevels.MEDIUM,
    summary: aiResult.summary || description.slice(0, 240),
    locationText,
    attachments,
    imageAttachment,
    imageVerified: Boolean(imageVerification?.verified),
    imageVerification: imageVerification
      ? {
          verified: Boolean(imageVerification.verified),
          confidence: imageVerification.confidence,
          reason: imageVerification.reason,
          model: imageVerification.model,
          verifiedAt: imageVerification.verifiedAt
        }
      : null,
    aiTriage: {
      model: aiResult.model,
      rawCategory: aiResult.category,
      rawDepartment: aiResult.department,
      rawPriority: aiResult.priority,
      summary: aiResult.summary,
      confidence: aiResult.confidence,
      fallbackUsed: aiResult.fallbackUsed,
      triagedAt: new Date()
    }
  });

  await StatusLog.create({
    complaint: complaint._id,
    fromStatus: ComplaintStatuses.RECEIVED,
    toStatus: ComplaintStatuses.RECEIVED,
    note: 'Complaint submitted and queued for triage.',
    changedBy: citizenId,
    actorRole: UserRoles.CITIZEN,
    source: 'system'
  });

  await createNotification({
    recipient: citizenId,
    complaint: complaint._id,
    type: 'complaint.created',
    title: 'Complaint submitted',
    message: `Your complaint ${complaint.complaintNumber} has been received and is being triaged.`,
    metadata: { complaintNumber: complaint.complaintNumber }
  });

  if (departmentId) {
    const officers = await User.find({
      role: UserRoles.OFFICER,
      department: departmentId,
      isActive: true
    }).select('_id');

    await Promise.all(
      officers.map((officer) => createNotification({
        recipient: officer._id,
        complaint: complaint._id,
        type: 'complaint.assigned',
        title: 'New complaint assigned',
        message: `A new complaint ${complaint.complaintNumber} was routed to your department.`,
        metadata: { complaintNumber: complaint.complaintNumber }
      }))
    );
  }

  return Complaint.findById(complaint._id).populate(populateComplaint());
};

export const listComplaints = async ({ user, filters = {} }) => {
  const query = {};

  if (user.role === UserRoles.CITIZEN) {
    query.citizen = user._id;
  } else if (user.role === UserRoles.OFFICER && user.department) {
    query.department = user.department;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  const complaints = await Complaint.find(query)
    .populate(populateComplaint())
    .sort({ createdAt: -1 })
    .limit(Number(filters.limit) || 100);

  return complaints;
};

export const getComplaintById = async (complaintId, user) => {
  const complaint = await Complaint.findById(complaintId).populate(populateComplaint());

  if (!complaint) {
    throw new HttpError(404, 'Complaint not found');
  }

  const isOwner = String(complaint.citizen?._id || complaint.citizen) === String(user._id);
  const isAdmin = user.role === UserRoles.ADMIN;
  const isOfficerInDepartment = user.role === UserRoles.OFFICER && String(user.department || '') === String(complaint.department?._id || complaint.department || '');

  if (!isOwner && !isAdmin && !isOfficerInDepartment) {
    throw new HttpError(403, 'You are not allowed to view this complaint');
  }

  const timeline = await StatusLog.find({ complaint: complaint._id })
    .populate('changedBy', 'name email role')
    .sort({ createdAt: 1 });

  return {
    complaint,
    timeline
  };
};

export const updateComplaintStatus = async ({ complaintId, status, note = '', user }) => {
  if (!Object.values(ComplaintStatuses).includes(status)) {
    throw new HttpError(400, 'Invalid complaint status');
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new HttpError(404, 'Complaint not found');
  }

  const canUpdate = user.role === UserRoles.ADMIN || (user.role === UserRoles.OFFICER && String(user.department || '') === String(complaint.department || ''));
  if (!canUpdate) {
    throw new HttpError(403, 'You are not allowed to update this complaint');
  }

  const previousStatus = complaint.status;
  complaint.status = status;

  if (status === ComplaintStatuses.RESOLVED) {
    complaint.resolvedAt = new Date();
  }

  if (status === ComplaintStatuses.CLOSED) {
    complaint.closedAt = new Date();
  }

  await complaint.save();

  await StatusLog.create({
    complaint: complaint._id,
    fromStatus: previousStatus,
    toStatus: status,
    note,
    changedBy: user._id,
    actorRole: user.role,
    source: 'admin-panel'
  });

  await createNotification({
    recipient: complaint.citizen,
    complaint: complaint._id,
    type: 'complaint.status.changed',
    title: 'Complaint status updated',
    message: `Your complaint ${complaint.complaintNumber} status changed to ${status}.`,
    metadata: { status }
  });

  return Complaint.findById(complaint._id).populate(populateComplaint());
};

export const buildComplaintAnalytics = async () => {
  const totalComplaints = await Complaint.countDocuments();

  const byStatus = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const byPriority = await Complaint.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const byDepartment = await Complaint.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    totalComplaints,
    byStatus,
    byPriority,
    byDepartment
  };
};