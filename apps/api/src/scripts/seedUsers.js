import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { UserRoles } from '../utils/constants.js';

const users = [
  {
    name: 'System Admin',
    email: 'admin@municipal.local',
    password: 'Admin@12345',
    role: UserRoles.ADMIN,
    phone: '9999999999',
    fakeId: 'FAKE-USER-001'
  },
  {
    name: 'Ward Officer',
    email: 'officer@municipal.local',
    password: 'Officer@12345',
    role: UserRoles.OFFICER,
    phone: '8888888888',
    departmentCode: 'SAN',
    employeeId: 'EMP-1001',
    fakeId: 'FAKE-USER-002'
  }
];

const run = async () => {
  await connectDb();

  const sanitationDepartment = await Department.findOne({ code: 'SAN' });

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      passwordHash,
      role: user.role,
      department: user.departmentCode === 'SAN' ? sanitationDepartment?._id || null : null,
      employeeId: user.employeeId || '',
      fakeId: user.fakeId || ''
    };

    await User.findOneAndUpdate(
      { email: user.email },
      { $set: payload },
      { upsert: true, new: true }
    );
  }

  console.log('Seeded admin and officer demo users.');
  await disconnectDb();
};

run().catch((error) => {
  console.error('User seeding failed:', error);
  process.exit(1);
});