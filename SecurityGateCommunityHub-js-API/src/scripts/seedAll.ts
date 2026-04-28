/**
 * seedAll.ts — Comprehensive seed script for SecurityGateApp
 * Run: npx ts-node src/scripts/seedAll.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User, { UserRole } from '../models/user.model';
import Visitor, { VisitorCategory, VisitorStatus } from '../models/visitor.model';
import Payment, { PaymentStatus } from '../models/payment.model';
import Complaint, { ComplaintStatus, ComplaintCategory } from '../models/complaint.model';
import Announcement from '../models/announcement.model';
import { Amenity, AmenityBooking, BookingStatus } from '../models/amenity.model';
import Event from '../models/event.model';
import Poll from '../models/poll.model';
import SOS, { SOSStatus } from '../models/sos.model';
import Notification from '../models/notification.model';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Visitor.deleteMany({}),
    Payment.deleteMany({}),
    Complaint.deleteMany({}),
    Announcement.deleteMany({}),
    Amenity.deleteMany({}),
    AmenityBooking.deleteMany({}),
    Event.deleteMany({}),
    Poll.deleteMany({}),
    SOS.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared all collections');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Users ──────────────────────────────────────────────────────────────────
  const [admin, resident1, resident2, guard, staff] = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@gateapp.com',
      password: await hash('Admin@123'),
      role: UserRole.ADMIN,
      unit: 'Office',
      phone: '+1-555-0100',
      residentSince: new Date('2020-01-01'),
    },
    {
      name: 'Alice Johnson',
      email: 'alice@gateapp.com',
      password: await hash('Alice@123'),
      role: UserRole.RESIDENT,
      unit: 'A-101',
      phone: '+1-555-0101',
      residentSince: new Date('2021-03-15'),
    },
    {
      name: 'Bob Smith',
      email: 'bob@gateapp.com',
      password: await hash('Bob@123'),
      role: UserRole.RESIDENT,
      unit: 'B-204',
      phone: '+1-555-0102',
      residentSince: new Date('2022-06-01'),
    },
    {
      name: 'Guard Carlos',
      email: 'carlos@gateapp.com',
      password: await hash('Guard@123'),
      role: UserRole.SECURITY,
      phone: '+1-555-0103',
    },
    {
      name: 'Staff Diana',
      email: 'diana@gateapp.com',
      password: await hash('Staff@123'),
      role: UserRole.STAFF,
      phone: '+1-555-0104',
    },
  ]);
  console.log('👥 Users seeded');

  // ── Visitors ───────────────────────────────────────────────────────────────
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const yesterday = new Date(now.getTime() - 86400000);

  await Visitor.insertMany([
    { name: 'John Doe', category: VisitorCategory.GUEST, purpose: 'Personal Visit', invitedBy: resident1._id, unit: 'A-101', status: VisitorStatus.APPROVED, checkInTime: tomorrow },
    { name: 'Pizza Delivery', category: VisitorCategory.DELIVERY, purpose: 'Food Delivery', invitedBy: resident1._id, unit: 'A-101', status: VisitorStatus.ACTIVE, checkInTime: now },
    { name: 'Plumber Mike', category: VisitorCategory.SERVICE, purpose: 'Pipe repair', invitedBy: resident2._id, unit: 'B-204', status: VisitorStatus.CHECKED_OUT, checkInTime: yesterday, checkOutTime: yesterday },
    { name: 'Sarah Connor', category: VisitorCategory.GUEST, purpose: 'Birthday party', invitedBy: resident2._id, unit: 'B-204', status: VisitorStatus.APPROVED, checkInTime: tomorrow },
    { name: 'Amazon Package', category: VisitorCategory.DELIVERY, purpose: 'Package delivery', invitedBy: resident2._id, unit: 'B-204', status: VisitorStatus.COMPLETED, checkInTime: yesterday, checkOutTime: yesterday },
    { name: 'Walk-in Guest', category: VisitorCategory.GUEST, purpose: 'Visiting friend', invitedBy: guard._id, unit: 'A-102', status: VisitorStatus.ACTIVE, checkInTime: now },
  ]);
  console.log('🚶 Visitors seeded');

  // ── Payments ───────────────────────────────────────────────────────────────
  await Payment.insertMany([
    { resident: resident1._id, amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-04', status: PaymentStatus.PAID, paidAt: new Date('2026-04-05'), recordedBy: admin._id },
    { resident: resident1._id, amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-05', status: PaymentStatus.PENDING, recordedBy: admin._id },
    { resident: resident2._id, amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-04', status: PaymentStatus.PAID, paidAt: new Date('2026-04-03'), recordedBy: admin._id },
    { resident: resident2._id, amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-05', status: PaymentStatus.PENDING, recordedBy: admin._id },
    { resident: resident1._id, amount: 500, description: 'Parking Fee', month: '2026-05', status: PaymentStatus.PENDING, recordedBy: admin._id },
  ]);
  console.log('💳 Payments seeded');

  // ── Complaints ─────────────────────────────────────────────────────────────
  await Complaint.insertMany([
    { title: 'Leaking pipe in bathroom', description: 'There is a water leak under the sink that has been ongoing for 3 days.', category: ComplaintCategory.MAINTENANCE, status: ComplaintStatus.IN_PROGRESS, raisedBy: resident1._id, assignedTo: staff._id },
    { title: 'Loud music after midnight', description: 'Neighbor in B-205 plays loud music after midnight on weekdays.', category: ComplaintCategory.NOISE, status: ComplaintStatus.OPEN, raisedBy: resident1._id },
    { title: 'Broken parking gate', description: 'The parking gate on the east side is stuck open.', category: ComplaintCategory.SECURITY, status: ComplaintStatus.RESOLVED, raisedBy: resident2._id, assignedTo: guard._id, resolution: 'Gate mechanism was repaired by maintenance team.' },
    { title: 'Garbage not collected', description: 'The garbage bins near Block B have not been emptied for 2 days.', category: ComplaintCategory.CLEANLINESS, status: ComplaintStatus.OPEN, raisedBy: resident2._id },
    { title: 'Unauthorized parking', description: 'Unknown vehicle parked in my reserved spot #A-12 for 2 days.', category: ComplaintCategory.PARKING, status: ComplaintStatus.CLOSED, raisedBy: resident1._id, resolution: 'Vehicle owner was notified and moved the car.' },
  ]);
  console.log('📋 Complaints seeded');

  // ── Announcements ──────────────────────────────────────────────────────────
  await Announcement.insertMany([
    { title: 'Water Supply Interruption', content: 'Water supply will be interrupted on May 2nd from 10am–2pm for pipeline maintenance. Please store water in advance.', postedBy: admin._id, isPinned: true },
    { title: 'Community BBQ — May 10th', content: 'Join us for a community BBQ at the clubhouse lawn on May 10th at 5pm. All residents and families are welcome!', postedBy: admin._id, isPinned: false },
    { title: 'New Security Protocol', content: 'Starting May 1st, all visitors must register at the gate and receive a QR pass before entry. Please inform your guests.', postedBy: admin._id, isPinned: true },
  ]);
  console.log('📢 Announcements seeded');

  // ── Amenities ──────────────────────────────────────────────────────────────
  const [pool, gym, clubhouse, tennis] = await Amenity.insertMany([
    { name: 'Swimming Pool', description: 'Olympic-size pool with lanes for lap swimming and a leisure area.', capacity: 30, isActive: true },
    { name: 'Fitness Center', description: 'Fully equipped gym with cardio machines, free weights, and yoga space.', capacity: 20, isActive: true },
    { name: 'Clubhouse', description: 'Multi-purpose hall for events, parties, and community meetings. Includes AV equipment.', capacity: 100, isActive: true },
    { name: 'Tennis Court', description: 'Two hard-surface tennis courts with lighting for evening play.', capacity: 8, isActive: true },
  ]);
  console.log('🏊 Amenities seeded');

  // ── Amenity Bookings ───────────────────────────────────────────────────────
  await AmenityBooking.insertMany([
    { amenity: pool._id, bookedBy: resident1._id, date: tomorrow, timeSlot: '07:00-08:00', status: BookingStatus.APPROVED },
    { amenity: gym._id, bookedBy: resident2._id, date: tomorrow, timeSlot: '06:00-07:00', status: BookingStatus.PENDING },
    { amenity: clubhouse._id, bookedBy: resident1._id, date: new Date(now.getTime() + 7 * 86400000), timeSlot: '18:00-21:00', status: BookingStatus.PENDING },
  ]);
  console.log('📅 Amenity bookings seeded');

  // ── Events ─────────────────────────────────────────────────────────────────
  await Event.insertMany([
    { title: 'Community BBQ', location: 'Clubhouse Lawn', date: new Date(now.getTime() + 12 * 86400000), rsvpRequired: true, description: 'Annual community BBQ. Bring your family!', createdBy: admin._id, rsvps: [resident1._id] },
    { title: 'Yoga in the Park', location: 'Community Garden', date: new Date(now.getTime() + 5 * 86400000), rsvpRequired: false, description: 'Morning yoga session open to all residents.', createdBy: admin._id, rsvps: [] },
    { title: 'Residents\' Meeting', location: 'Clubhouse Hall A', date: new Date(now.getTime() + 20 * 86400000), rsvpRequired: true, description: 'Quarterly residents\' meeting to discuss community matters.', createdBy: admin._id, rsvps: [resident1._id, resident2._id] },
  ]);
  console.log('🎉 Events seeded');

  // ── Polls ──────────────────────────────────────────────────────────────────
  await Poll.insertMany([
    {
      question: 'Should we extend pool hours to 10pm on weekends?',
      options: [
        { option: 'Yes, extend to 10pm', votes: 12 },
        { option: 'Keep current hours (8pm)', votes: 5 },
        { option: 'No preference', votes: 3 },
      ],
      endsAt: new Date(now.getTime() + 7 * 86400000),
      createdBy: admin._id,
      votedBy: [resident1._id],
    },
    {
      question: 'Which new amenity would you like added?',
      options: [
        { option: 'Basketball Court', votes: 8 },
        { option: 'Children\'s Play Area', votes: 15 },
        { option: 'Rooftop Garden', votes: 6 },
        { option: 'Co-working Space', votes: 10 },
      ],
      endsAt: new Date(now.getTime() + 14 * 86400000),
      createdBy: admin._id,
      votedBy: [],
    },
  ]);
  console.log('🗳️  Polls seeded');

  // ── SOS ────────────────────────────────────────────────────────────────────
  await SOS.insertMany([
    { raisedBy: resident1._id, unit: 'A-101', message: 'Suspicious person near parking lot!', status: SOSStatus.ACTIVE },
    { raisedBy: resident2._id, unit: 'B-204', message: 'Medical emergency — need help immediately!', status: SOSStatus.RESOLVED, resolvedBy: guard._id },
  ]);
  console.log('🚨 SOS alerts seeded');

  // ── Notifications ──────────────────────────────────────────────────────────
  await Notification.insertMany([
    { user: resident1._id, type: 'announcement', message: 'New announcement: Water Supply Interruption on May 2nd', read: false },
    { user: resident1._id, type: 'delivery', message: 'Your delivery (Pizza Delivery) has arrived at the gate', read: false },
    { user: resident1._id, type: 'visitor', message: 'Your visitor John Doe is scheduled for tomorrow', read: true },
    { user: resident2._id, type: 'announcement', message: 'New announcement: New Security Protocol starting May 1st', read: false },
    { user: resident2._id, type: 'payment', message: 'Payment reminder: Maintenance fee for May 2026 is due', read: false },
    { user: resident2._id, type: 'complaint', message: 'Your complaint "Broken parking gate" has been resolved', read: true },
    { user: guard._id, type: 'sos', message: 'SOS Alert from Unit A-101: Suspicious person near parking lot!', read: false },
  ]);
  console.log('🔔 Notifications seeded');

  console.log('\n✅ All seed data inserted successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:    admin@gateapp.com   / Admin@123');
  console.log('  Resident: alice@gateapp.com   / Alice@123');
  console.log('  Resident: bob@gateapp.com     / Bob@123');
  console.log('  Security: carlos@gateapp.com  / Guard@123');
  console.log('  Staff:    diana@gateapp.com   / Staff@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
