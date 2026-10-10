import Department from '../models/Department.js';
import { connectDb, disconnectDb } from '../config/db.js';

const seedDepartments = [
  {
    code: 'SAN',
    name: 'Sanitation Department',
    description: 'Handles waste collection, cleaning, and sanitation-related grievances.',
    routingKeywords: ['garbage', 'trash', 'waste', 'cleaning', 'sanitation']
  },
  {
    code: 'WATER',
    name: 'Water Supply Department',
    description: 'Handles water leaks, supply interruptions, and drinking water complaints.',
    routingKeywords: ['water', 'tap', 'pipeline', 'leak', 'supply']
  },
  {
    code: 'PWD',
    name: 'Public Works Department',
    description: 'Handles roads, potholes, and street infrastructure complaints.',
    routingKeywords: ['road', 'pothole', 'street repair', 'broken road']
  },
  {
    code: 'ELEC',
    name: 'Electrical Department',
    description: 'Handles street lighting and local electricity-related complaints.',
    routingKeywords: ['street light', 'lamp', 'electricity', 'power', 'outage']
  },
  {
    code: 'DRAIN',
    name: 'Drainage Department',
    description: 'Handles sewage, drainage, and overflow complaints.',
    routingKeywords: ['drain', 'sewage', 'overflow', 'manhole', 'drainage']
  }
];

const run = async () => {
  await connectDb();

  for (const department of seedDepartments) {
    await Department.findOneAndUpdate(
      { code: department.code },
      { $set: department },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${seedDepartments.length} departments.`);
  await disconnectDb();
};

run().catch((error) => {
  console.error('Department seeding failed:', error);
  process.exit(1);
});