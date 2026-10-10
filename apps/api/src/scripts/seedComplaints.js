import bcrypt from 'bcryptjs';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { ComplaintCategories, ComplaintStatuses, PriorityLevels, UserRoles } from '../utils/constants.js';

const citizenSeedData = [
  {
    name: 'Asha Kumar',
    email: 'asha.kumar@municipal.local',
    password: 'Citizen@12345',
    phone: '7012345678',
    fakeId: 'FAKE-USER-101'
  },
  {
    name: 'Ravi Menon',
    email: 'ravi.menon@municipal.local',
    password: 'Citizen@12345',
    phone: '7023456789',
    fakeId: 'FAKE-USER-102'
  },
  {
    name: 'Nisha Das',
    email: 'nisha.das@municipal.local',
    password: 'Citizen@12345',
    phone: '7034567890',
    fakeId: 'FAKE-USER-103'
  },
  {
    name: 'Kiran Rao',
    email: 'kiran.rao@municipal.local',
    password: 'Citizen@12345',
    phone: '7045678901',
    fakeId: 'FAKE-USER-104'
  }
];

const officerSeedData = [
  {
    name: 'Ward Officer',
    email: 'officer@municipal.local',
    password: 'Officer@12345',
    phone: '8888888888',
    departmentCode: 'SAN',
    employeeId: 'EMP-1001',
    fakeId: 'FAKE-USER-002'
  },
  {
    name: 'Water Inspector',
    email: 'water.inspector@municipal.local',
    password: 'Officer@12345',
    phone: '7777777777',
    departmentCode: 'WATER',
    employeeId: 'EMP-1002',
    fakeId: 'FAKE-USER-003'
  }
];

const complaintSeedData = [
  {
    complaintNumber: 'CMP-2026-001',
    title: 'Garbage pile near Market Road',
    description: 'A large pile of mixed waste has accumulated near the market entrance for the past three days, causing bad smell and attracting flies.',
    category: ComplaintCategories.WASTE_MANAGEMENT,
    departmentCode: 'SAN',
    priority: PriorityLevels.HIGH,
    status: ComplaintStatuses.IN_PROGRESS,
    summary: 'Municipal sanitation team needed for waste removal.',
    locationText: 'Market Road, Ward 12',
    citizenEmail: 'asha.kumar@municipal.local',
    assignedOfficerEmail: 'officer@municipal.local',
    createdAt: new Date('2026-07-20T09:15:00.000Z')
  },
  {
    complaintNumber: 'CMP-2026-002',
    title: 'Water leakage on 5th Cross Street',
    description: 'A burst pipeline is flooding the roadside and causing water to seep into nearby homes.',
    category: ComplaintCategories.WATER_SUPPLY,
    departmentCode: 'WATER',
    priority: PriorityLevels.CRITICAL,
    status: ComplaintStatuses.RECEIVED,
    summary: 'Urgent repair needed for burst pipeline.',
    locationText: '5th Cross Street, Ward 8',
    citizenEmail: 'ravi.menon@municipal.local',
    assignedOfficerEmail: 'water.inspector@municipal.local',
    createdAt: new Date('2026-07-21T11:30:00.000Z')
  },
  {
    complaintNumber: 'CMP-2026-003',
    title: 'Potholes near school entrance',
    description: 'Several potholes have developed near the school entrance and are unsafe for children and vehicles.',
    category: ComplaintCategories.ROAD_MAINTENANCE,
    departmentCode: 'PWD',
    priority: PriorityLevels.MEDIUM,
    status: ComplaintStatuses.RESOLVED,
    summary: 'Road patching completed after inspection.',
    locationText: 'School Road, Ward 4',
    citizenEmail: 'nisha.das@municipal.local',
    assignedOfficerEmail: 'officer@municipal.local',
    createdAt: new Date('2026-07-18T07:45:00.000Z'),
    resolvedAt: new Date('2026-07-24T16:00:00.000Z')
  },
  {
    complaintNumber: 'CMP-2026-004',
    title: 'Streetlight not working near park',
    description: 'The streetlight near the community park has been out for more than a week, making the area unsafe at night.',
    category: ComplaintCategories.STREET_LIGHTING,
    departmentCode: 'ELEC',
    priority: PriorityLevels.MEDIUM,
    status: ComplaintStatuses.IN_PROGRESS,
    summary: 'Electrical maintenance team assigned.',
    locationText: 'Park Avenue, Ward 6',
    citizenEmail: 'kiran.rao@municipal.local',
    assignedOfficerEmail: 'officer@municipal.local',
    createdAt: new Date('2026-07-22T18:20:00.000Z')
  },
  {
    complaintNumber: 'CMP-2026-005',
    title: 'Drain overflow outside temple lane',
    description: 'The drainage channel near the temple lane is overflowing into the street after heavy rain.',
    category: ComplaintCategories.SEWAGE_DRAINAGE,
    departmentCode: 'DRAIN',
    priority: PriorityLevels.HIGH,
    status: ComplaintStatuses.CLOSED,
    summary: 'Drainage blockage cleared and area cleaned.',
    locationText: 'Temple Lane, Ward 9',
    citizenEmail: 'asha.kumar@municipal.local',
    assignedOfficerEmail: 'officer@municipal.local',
    createdAt: new Date('2026-07-16T13:00:00.000Z'),
    resolvedAt: new Date('2026-07-17T10:30:00.000Z'),
    closedAt: new Date('2026-07-17T12:00:00.000Z')
  }
];

const ensureUsers = async () => {
  for (const user of [...citizenSeedData, ...officerSeedData]) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const role = user.departmentCode ? UserRoles.OFFICER : UserRoles.CITIZEN;

    await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          passwordHash,
          role,
          isActive: true,
          fakeId: user.fakeId || ''
        }
      },
      { upsert: true, new: true }
    );
  }
};

const run = async () => {
  await connectDb();

  await ensureUsers();

  const departments = await Department.find({}).lean();
  const departmentByCode = new Map(departments.map((department) => [department.code, department]));
  const officerByEmail = new Map();
  const citizenByEmail = new Map();

  const users = await User.find({}).lean();
  for (const user of users) {
    if (user.role === UserRoles.OFFICER) {
      officerByEmail.set(user.email, user._id);
    } else if (user.role === UserRoles.CITIZEN) {
      citizenByEmail.set(user.email, user._id);
    }
  }

  for (const complaint of complaintSeedData) {
    const citizenId = citizenByEmail.get(complaint.citizenEmail);
    const assignedOfficerId = officerByEmail.get(complaint.assignedOfficerEmail);
    const department = departmentByCode.get(complaint.departmentCode);

    if (!citizenId || !department) {
      continue;
    }

    await Complaint.findOneAndUpdate(
      { complaintNumber: complaint.complaintNumber },
      {
        $set: {
          complaintNumber: complaint.complaintNumber,
          citizen: citizenId,
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          department: department._id,
          priority: complaint.priority,
          status: complaint.status,
          summary: complaint.summary,
          locationText: complaint.locationText,
          assignedOfficer: assignedOfficerId || null,
          createdAt: complaint.createdAt,
          resolvedAt: complaint.resolvedAt || null,
          closedAt: complaint.closedAt || null,
          metadata: { seeded: true, source: 'demo-data' }
        }
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${complaintSeedData.length} demo complaints.`);
  await disconnectDb();
};

run().catch((error) => {
  console.error('Complaint seeding failed:', error);
  process.exit(1);
});
