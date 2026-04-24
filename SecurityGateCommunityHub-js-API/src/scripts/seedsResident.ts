import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/user.model';
import Notification from '../models/notification.model';
import Event from '../models/event.model';
import Poll from '../models/poll.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Notification.deleteMany({});
  await Event.deleteMany({});
  await Poll.deleteMany({});

  // 1. Create Users
  const resident = await User.create({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedpassword', // Use a real hash in production!
    role: UserRole.RESIDENT,
    unit: 'A-123',
    phone: '(555) 123-4567',
    residentSince: new Date('2022-01-15')
  });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'hashedpassword',
    role: UserRole.ADMIN
  });

  const security = await User.create({
    name: 'Michael Johnson',
    email: 'security@example.com',
    password: 'hashedpassword',
    role: UserRole.SECURITY
  });

  const staff = await User.create({
    name: 'Lisa Chen',
    email: 'staff@example.com',
    password: 'hashedpassword',
    role: UserRole.STAFF
  });

  // 2. Notifications for Resident
  await Notification.insertMany([
    {
      user: resident._id,
      type: 'Visitor Arrival',
      message: 'Sarah Johnson arrived at the gate',
      read: false
    },
    {
      user: resident._id,
      type: 'Community Announcement',
      message: 'Pool maintenance scheduled for tomorrow',
      read: false
    },
    {
      user: resident._id,
      type: 'Payment Due Reminder',
      message: 'Monthly maintenance fee due in 3 days',
      read: true
    }
  ]);

  // 3. Events
  await Event.insertMany([
    {
      title: 'Summer BBQ Party',
      location: 'Main Pavilion',
      date: new Date('2024-07-20T18:00:00Z'),
      rsvpRequired: true,
      description: 'Join us for the annual community BBQ on July 20th at the main pavilion.'
    },
    {
      title: 'Yoga Class',
      location: 'Community Center',
      date: new Date('2024-07-25T07:00:00Z'),
      rsvpRequired: false,
      description: 'Morning yoga class for all residents.'
    }
  ]);

  // 4. Polls
  await Poll.insertMany([
    {
      question: 'Should we install new playground equipment?',
      options: [
        { option: 'Yes, install new equipment', votes: 32 },
        { option: 'No, keep current setup', votes: 15 }
      ],
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    {
      question: 'Preferred Gym Hours Extension?',
      options: [
        { option: '6 AM - 10 PM', votes: 12 },
        { option: '24/7 Access', votes: 11 }
      ],
      endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) // 12 days from now
    }
  ]);

  console.log('Dummy data seeded!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
