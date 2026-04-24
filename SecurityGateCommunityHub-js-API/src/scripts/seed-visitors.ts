import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Visitor, { VisitorCategory, VisitorStatus } from '../models/visitor.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function seedVisitors() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Visitor.deleteMany({});

  await Visitor.insertMany([
    {
      name: 'Sarah Johnson',
      photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      category: VisitorCategory.RESIDENT,
      purpose: 'Business Meeting',
      invitedBy: '687aa555ea9437789981b19f',
      unit: 'Apt 205',
      status: VisitorStatus.APPROVED,
      checkInTime: new Date(),
      entryPoint: 'Main Entrance'
    },
    {
      name: 'Mike Chen',
      photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      category: VisitorCategory.DELIVERY,
      purpose: 'Delivery',
      invitedBy: '687aa555ea9437789981b19f',
      unit: 'Apt 205',
      status: VisitorStatus.PENDING,
      checkInTime: new Date(),
      entryPoint: 'Service Entrance'
    },
    {
      name: 'Emma Wilson',
      photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
      category: VisitorCategory.GUEST,
      purpose: 'Guest of John Doe',
      invitedBy: '687aa555ea9437789981b19f',
      unit: 'Apt 205',
      status: VisitorStatus.ACTIVE,
      checkInTime: new Date(),
      entryPoint: 'Main Entrance'
    }
  ]);

  console.log('Dummy visitors seeded!');
  await mongoose.disconnect();
}

seedVisitors().catch(err => {
  console.error(err);
  process.exit(1);
});
