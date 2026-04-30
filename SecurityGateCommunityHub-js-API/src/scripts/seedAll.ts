/**
 * seedAll.ts — Full seed script for SecurityGateApp (v0.5.0)
 * Covers ALL 15 models: User, Visitor, Delivery, Staff, AttendanceLog,
 * GateLog, CommunityFeed, Payment, Complaint, Announcement, Amenity,
 * AmenityBooking, Event, Poll, SOS, Notification
 *
 * Run: npx ts-node src/scripts/seedAll.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import QRCode from 'qrcode';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User, { UserRole } from '../models/user.model';
import Visitor, { VisitorCategory, VisitorStatus } from '../models/visitor.model';
import Delivery, { DeliveryStatus } from '../models/delivery.model';
import Staff, { StaffType, StaffStatus } from '../models/staff.model';
import AttendanceLog from '../models/attendanceLog.model';
import GateLog, { GateLogAction } from '../models/gateLog.model';
import CommunityFeed, { FeedCategory, FeedStatus } from '../models/communityFeed.model';
import Payment, { PaymentStatus } from '../models/payment.model';
import Complaint, { ComplaintStatus, ComplaintCategory } from '../models/complaint.model';
import Announcement from '../models/announcement.model';
import { Amenity, AmenityBooking, BookingStatus } from '../models/amenity.model';
import Event from '../models/event.model';
import Poll from '../models/poll.model';
import SOS, { SOSStatus } from '../models/sos.model';
import Notification from '../models/notification.model';

const hash = (pw: string) => bcrypt.hash(pw, 10);
const daysAgo  = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── Clear ALL collections ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Visitor.deleteMany({}),
    Delivery.deleteMany({}),
    Staff.deleteMany({}),
    AttendanceLog.deleteMany({}),
    GateLog.deleteMany({}),
    CommunityFeed.deleteMany({}),
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
  console.log('🗑️  Cleared all 16 collections');

  // ── 1. USERS ───────────────────────────────────────────────────────────────
  const [superUser, admin, alice, bob, charlie, diana, guard1, guard2, staffMgr] =
    await User.insertMany([
      {
        name: 'Super User',
        email: 'super@gateapp.com',
        password: await hash('Super@123'),
        role: UserRole.SUPERUSER,
        unit: 'HQ',
        phone: '+91-99000-00000',
        residentSince: new Date('2019-01-01'),
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SU',
      },
      {
        name: 'Admin Raj',
        email: 'admin@gateapp.com',
        password: await hash('Admin@123'),
        role: UserRole.ADMIN,
        unit: 'Office',
        phone: '+91-99000-00100',
        residentSince: new Date('2020-01-01'),
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AR',
      },
      {
        name: 'Alice Johnson',
        email: 'alice@gateapp.com',
        password: await hash('Alice@123'),
        role: UserRole.RESIDENT,
        unit: 'A-101',
        phone: '+91-99000-00101',
        residentSince: new Date('2021-03-15'),
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ',
      },
      {
        name: 'Bob Smith',
        email: 'bob@gateapp.com',
        password: await hash('Bob@123'),
        role: UserRole.RESIDENT,
        unit: 'B-204',
        phone: '+91-99000-00102',
        residentSince: new Date('2022-06-01'),
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS',
      },
      {
        name: 'Charlie Patel',
        email: 'charlie@gateapp.com',
        password: await hash('Charlie@123'),
        role: UserRole.RESIDENT,
        unit: 'C-305',
        phone: '+91-99000-00103',
        residentSince: new Date('2023-01-10'),
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CP',
      },
      {
        name: 'Diana Mehta',
        email: 'diana@gateapp.com',
        password: await hash('Diana@123'),
        role: UserRole.RESIDENT,
        unit: 'D-402',
        phone: '+91-99000-00104',
        residentSince: new Date('2020-09-20'),
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM',
      },
      {
        name: 'Guard Carlos',
        email: 'carlos@gateapp.com',
        password: await hash('Guard@123'),
        role: UserRole.SECURITY,
        phone: '+91-99000-00200',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GC',
      },
      {
        name: 'Guard Ravi',
        email: 'ravi@gateapp.com',
        password: await hash('Guard@123'),
        role: UserRole.SECURITY,
        phone: '+91-99000-00201',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GR',
      },
      {
        name: 'Staff Manager Priya',
        email: 'priya@gateapp.com',
        password: await hash('Staff@123'),
        role: UserRole.STAFF,
        phone: '+91-99000-00300',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SP',
      },
    ]);
  console.log('👥 Users seeded (9)');

  // ── 2. VISITORS ────────────────────────────────────────────────────────────
  const otp1 = '482910';
  const qr1 = await QRCode.toDataURL(JSON.stringify({ visitorId: 'v1', otp: otp1, name: 'John Doe', unit: 'A-101' }));

  await Visitor.insertMany([
    // Pre-approved with OTP (upcoming)
    {
      name: 'John Doe', phone: '+91-98765-11111',
      category: VisitorCategory.GUEST, purpose: 'Birthday celebration',
      invitedBy: alice._id, unit: 'A-101',
      status: VisitorStatus.OTP_SENT,
      checkInTime: daysAhead(1),
      otp: otp1, otpExpiresAt: daysAhead(2), otpVerified: false,
      qrCode: qr1,
    },
    // Approved and verified
    {
      name: 'Priya Sharma', phone: '+91-98765-22222',
      category: VisitorCategory.GUEST, purpose: 'Family visit',
      invitedBy: alice._id, unit: 'A-101',
      status: VisitorStatus.APPROVED,
      checkInTime: daysAhead(2),
      otpVerified: true,
      qrCode: await QRCode.toDataURL('priya-sharma-pass'),
    },
    // Currently active inside
    {
      name: 'Flipkart Delivery', phone: '+91-98765-33333',
      category: VisitorCategory.DELIVERY, purpose: 'Package delivery',
      invitedBy: bob._id, unit: 'B-204',
      status: VisitorStatus.ACTIVE,
      checkInTime: new Date(),
      otpVerified: true,
      photoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=FD',
    },
    // Checked out
    {
      name: 'Plumber Suresh', phone: '+91-98765-44444',
      category: VisitorCategory.SERVICE, purpose: 'Bathroom pipe repair',
      invitedBy: bob._id, unit: 'B-204',
      status: VisitorStatus.CHECKED_OUT,
      checkInTime: daysAgo(1),
      checkOutTime: new Date(daysAgo(1).getTime() + 2 * 3600000),
      otpVerified: true,
      vehicleNumber: 'GJ-01-AB-1234',
    },
    // Denied
    {
      name: 'Unknown Person',
      category: VisitorCategory.GUEST, purpose: 'Unknown',
      invitedBy: guard1._id, unit: 'Unknown',
      status: VisitorStatus.DENIED,
      checkInTime: daysAgo(1),
    },
    // Walk-in active
    {
      name: 'Amazon Courier', phone: '+91-98765-55555',
      category: VisitorCategory.DELIVERY, purpose: 'Express delivery',
      invitedBy: guard1._id, unit: 'C-305',
      status: VisitorStatus.ACTIVE,
      checkInTime: new Date(Date.now() - 30 * 60000),
      otpVerified: true,
      vehicleNumber: 'MH-02-CD-5678',
    },
    // Completed yesterday
    {
      name: 'Electrician Ramesh',
      category: VisitorCategory.SERVICE, purpose: 'AC servicing',
      invitedBy: charlie._id, unit: 'C-305',
      status: VisitorStatus.COMPLETED,
      checkInTime: daysAgo(2),
      checkOutTime: new Date(daysAgo(2).getTime() + 3 * 3600000),
      otpVerified: true,
    },
    // Vendor with pass
    {
      name: 'Vendor Rajesh', phone: '+91-98765-66666',
      category: VisitorCategory.VENDOR, purpose: 'Grocery supply',
      invitedBy: diana._id, unit: 'D-402',
      status: VisitorStatus.APPROVED,
      checkInTime: daysAhead(3),
      otpVerified: false,
      otp: '991234', otpExpiresAt: daysAhead(4),
    },
  ]);
  console.log('🚶 Visitors seeded (8)');

  // ── 3. DELIVERIES ──────────────────────────────────────────────────────────
  await Delivery.insertMany([
    // Pending — awaiting resident approval
    {
      resident: alice._id, deliveryPerson: 'Zomato Rider Arjun',
      deliveryCompany: 'Zomato', purpose: 'Food delivery', items: '2 meals',
      status: DeliveryStatus.PENDING, requestedAt: new Date(),
    },
    // Approved
    {
      resident: bob._id, deliveryPerson: 'Swiggy Rider Kiran',
      deliveryCompany: 'Swiggy', purpose: 'Grocery delivery', items: 'Vegetables, fruits',
      status: DeliveryStatus.APPROVED, requestedAt: daysAgo(1),
      approvedAt: new Date(daysAgo(1).getTime() + 10 * 60000),
    },
    // Left at gate
    {
      resident: charlie._id, deliveryPerson: 'DTDC Courier',
      deliveryCompany: 'DTDC', purpose: 'Document delivery', items: 'Legal documents',
      status: DeliveryStatus.LEFT_AT_GATE, requestedAt: daysAgo(2),
      leftAtGateReason: 'Resident not available, left at security desk',
      completedAt: daysAgo(2),
    },
    // Rejected
    {
      resident: diana._id, deliveryPerson: 'Unknown Rider',
      purpose: 'Unknown package', items: 'Unverified parcel',
      status: DeliveryStatus.REJECTED, requestedAt: daysAgo(3),
    },
    // Completed
    {
      resident: alice._id, deliveryPerson: 'Amazon Delivery',
      deliveryCompany: 'Amazon', purpose: 'Online shopping', items: 'Electronics',
      status: DeliveryStatus.COMPLETED, requestedAt: daysAgo(4),
      approvedAt: new Date(daysAgo(4).getTime() + 5 * 60000),
      completedAt: daysAgo(4),
    },
    // Pending — clubbed
    {
      resident: bob._id, deliveryPerson: 'Meesho Courier',
      deliveryCompany: 'Meesho', purpose: 'Clothing delivery', items: 'Shirts x3',
      status: DeliveryStatus.PENDING, requestedAt: new Date(Date.now() - 2 * 3600000),
    },
  ]);
  console.log('📦 Deliveries seeded (6)');

  // ── 4. STAFF (Domestic Help) ───────────────────────────────────────────────
  const maidQR  = await QRCode.toDataURL(JSON.stringify({ staffId: 'staff-1', name: 'Sunita Devi', type: 'Maid', unit: 'A-101' }));
  const driverQR = await QRCode.toDataURL(JSON.stringify({ staffId: 'staff-2', name: 'Ramesh Kumar', type: 'Driver', unit: 'B-204' }));
  const cookQR  = await QRCode.toDataURL(JSON.stringify({ staffId: 'staff-3', name: 'Meena Bai', type: 'Cook', unit: 'C-305' }));

  const [maid, driver, cook, gardener, plumber] = await Staff.insertMany([
    {
      name: 'Sunita Devi', phone: '+91-97000-11111',
      type: StaffType.MAID, assignedTo: alice._id,
      unit: 'A-101', status: StaffStatus.ACTIVE,
      vendorPassUrl: maidQR,
    },
    {
      name: 'Ramesh Kumar', phone: '+91-97000-22222',
      type: StaffType.DRIVER, assignedTo: bob._id,
      unit: 'B-204', status: StaffStatus.ACTIVE,
      vendorPassUrl: driverQR,
    },
    {
      name: 'Meena Bai', phone: '+91-97000-33333',
      type: StaffType.COOK, assignedTo: charlie._id,
      unit: 'C-305', status: StaffStatus.ACTIVE,
      vendorPassUrl: cookQR,
    },
    {
      name: 'Raju Mali', phone: '+91-97000-44444',
      type: StaffType.GARDENER, assignedTo: diana._id,
      unit: 'D-402', status: StaffStatus.ACTIVE,
      vendorPassUrl: await QRCode.toDataURL('raju-mali-pass'),
    },
    {
      name: 'Vikram Plumber', phone: '+91-97000-55555',
      type: StaffType.PLUMBER, assignedTo: alice._id,
      unit: 'A-101', status: StaffStatus.SUSPENDED,
    },
  ]);
  console.log('👷 Staff seeded (5)');

  // ── 5. ATTENDANCE LOGS ─────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const dayBefore = new Date(today.getTime() - 2 * 86400000);

  await AttendanceLog.insertMany([
    // Maid — today checked in, not yet out
    {
      staff: maid._id, unit: 'A-101', date: today,
      checkIn: new Date(today.getTime() + 8 * 3600000),
      healthStatus: 'Healthy', temperature: 36.6,
      loggedBy: guard1._id,
    },
    // Maid — yesterday full day
    {
      staff: maid._id, unit: 'A-101', date: yesterday,
      checkIn: new Date(yesterday.getTime() + 8 * 3600000),
      checkOut: new Date(yesterday.getTime() + 12 * 3600000),
      workedHours: 4, healthStatus: 'Healthy', temperature: 36.8,
      loggedBy: guard1._id,
    },
    // Driver — today
    {
      staff: driver._id, unit: 'B-204', date: today,
      checkIn: new Date(today.getTime() + 7 * 3600000),
      checkOut: new Date(today.getTime() + 15 * 3600000),
      workedHours: 8, healthStatus: 'Healthy', temperature: 37.0,
      loggedBy: guard1._id,
    },
    // Cook — yesterday sick
    {
      staff: cook._id, unit: 'C-305', date: yesterday,
      checkIn: new Date(yesterday.getTime() + 9 * 3600000),
      checkOut: new Date(yesterday.getTime() + 11 * 3600000),
      workedHours: 2, healthStatus: 'Sick', temperature: 38.5,
      notes: 'Sent home early due to fever',
      loggedBy: guard2._id,
    },
    // Cook — day before
    {
      staff: cook._id, unit: 'C-305', date: dayBefore,
      checkIn: new Date(dayBefore.getTime() + 9 * 3600000),
      checkOut: new Date(dayBefore.getTime() + 13 * 3600000),
      workedHours: 4, healthStatus: 'Healthy', temperature: 36.5,
      loggedBy: guard2._id,
    },
    // Gardener — today
    {
      staff: gardener._id, unit: 'D-402', date: today,
      checkIn: new Date(today.getTime() + 6 * 3600000),
      checkOut: new Date(today.getTime() + 10 * 3600000),
      workedHours: 4, healthStatus: 'Healthy',
      loggedBy: guard2._id,
    },
  ]);
  console.log('📋 Attendance logs seeded (6)');

  // ── 6. GATE LOGS ───────────────────────────────────────────────────────────
  await GateLog.insertMany([
    // Today's events
    { action: GateLogAction.VISITOR_CHECKIN,       performedBy: guard1._id, visitorName: 'Flipkart Delivery', unit: 'B-204', description: 'Flipkart Delivery — Active', createdAt: new Date(Date.now() - 20 * 60000) },
    { action: GateLogAction.STAFF_CHECKIN,         performedBy: guard1._id, visitorName: 'Sunita Devi',       unit: 'A-101', description: 'Staff check-in: Sunita Devi (Maid) — Unit A-101', createdAt: new Date(Date.now() - 60 * 60000) },
    { action: GateLogAction.DELIVERY_APPROVED,     performedBy: guard1._id, description: 'Delivery from Swiggy Rider Kiran — approved', createdAt: new Date(Date.now() - 90 * 60000) },
    { action: GateLogAction.VISITOR_CHECKIN,       performedBy: guard2._id, visitorName: 'Amazon Courier',   unit: 'C-305', description: 'Walk-in: Amazon Courier — Express delivery', createdAt: new Date(Date.now() - 30 * 60000) },
    { action: GateLogAction.STAFF_CHECKIN,         performedBy: guard2._id, visitorName: 'Ramesh Kumar',     unit: 'B-204', description: 'Staff check-in: Ramesh Kumar (Driver) — Unit B-204', createdAt: new Date(Date.now() - 3 * 3600000) },
    { action: GateLogAction.STAFF_CHECKOUT,        performedBy: guard2._id, visitorName: 'Ramesh Kumar',     unit: 'B-204', description: 'Staff check-out: Ramesh Kumar — 8h worked', createdAt: new Date(Date.now() - 1 * 3600000) },
    // Yesterday
    { action: GateLogAction.VISITOR_CHECKIN,       performedBy: guard1._id, visitorName: 'Plumber Suresh',   unit: 'B-204', description: 'Plumber Suresh — Active', createdAt: daysAgo(1) },
    { action: GateLogAction.VISITOR_CHECKOUT,      performedBy: guard1._id, visitorName: 'Plumber Suresh',   unit: 'B-204', description: 'Plumber Suresh — Checked Out', createdAt: new Date(daysAgo(1).getTime() + 2 * 3600000) },
    { action: GateLogAction.VISITOR_DENIED,        performedBy: guard2._id, visitorName: 'Unknown Person',   description: 'Unknown Person — Denied', createdAt: daysAgo(1) },
    { action: GateLogAction.DELIVERY_LEFT_AT_GATE, performedBy: guard1._id, description: 'Parcel left at gate — DTDC Courier', createdAt: daysAgo(2) },
    { action: GateLogAction.SOS_TRIGGERED,         performedBy: guard1._id, unit: 'A-101', description: 'SOS Alert from Unit A-101: Suspicious person near parking lot!', createdAt: daysAgo(3) },
    { action: GateLogAction.GATE_OPENED,           performedBy: guard1._id, description: 'Main gate opened for maintenance vehicle', createdAt: daysAgo(4) },
  ]);
  console.log('🚪 Gate logs seeded (12)');

  // ── 7. COMMUNITY FEED ─────────────────────────────────────────────────────
  await CommunityFeed.insertMany([
    {
      title: 'Selling sofa set — excellent condition',
      description: '3-seater + 2-seater sofa set, 2 years old, barely used. Shifting to a new city. Pickup from Unit A-101.',
      category: FeedCategory.SELL, status: FeedStatus.ACTIVE,
      postedBy: alice._id, price: 15000, unit: 'A-101',
      contactPhone: '+91-99000-00101',
      likes: [bob._id, charlie._id],
    },
    {
      title: 'Looking to buy a study table',
      description: 'Need a study table with storage. Budget ₹3000–5000. Prefer wooden. Please contact if you have one.',
      category: FeedCategory.BUY, status: FeedStatus.ACTIVE,
      postedBy: bob._id, unit: 'B-204',
      contactPhone: '+91-99000-00102',
      likes: [],
    },
    {
      title: 'Parking spot for rent — Block C',
      description: 'Covered parking spot available for rent near Block C. ₹800/month. Available from June 1st.',
      category: FeedCategory.RENT, status: FeedStatus.ACTIVE,
      postedBy: charlie._id, price: 800, unit: 'C-305',
      contactPhone: '+91-99000-00103',
      likes: [alice._id, diana._id, bob._id],
    },
    {
      title: 'Lost: Black umbrella near swimming pool',
      description: 'Lost a black Windproof umbrella near the swimming pool area on April 28th. Please contact if found.',
      category: FeedCategory.LOST_FOUND, status: FeedStatus.ACTIVE,
      postedBy: diana._id, unit: 'D-402',
      contactPhone: '+91-99000-00104',
      likes: [alice._id],
    },
    {
      title: 'Community Diwali Celebration — Nov 1st',
      description: 'Residents are invited to join the Diwali celebration at the clubhouse lawn. Rangoli, sweets, and fireworks!',
      category: FeedCategory.EVENT, status: FeedStatus.ACTIVE,
      postedBy: admin._id,
      likes: [alice._id, bob._id, charlie._id, diana._id],
    },
    {
      title: 'Yoga mats for sale — set of 3',
      description: 'Selling 3 yoga mats (6mm thick, non-slip). Used only 5 times. ₹500 each or ₹1200 for all 3.',
      category: FeedCategory.SELL, status: FeedStatus.SOLD,
      postedBy: alice._id, price: 1200, unit: 'A-101',
      likes: [bob._id],
    },
    {
      title: 'General: Recommend a good plumber?',
      description: 'Looking for a reliable plumber for bathroom renovation. Anyone have a good contact? Please share.',
      category: FeedCategory.GENERAL, status: FeedStatus.ACTIVE,
      postedBy: charlie._id, unit: 'C-305',
      likes: [diana._id],
    },
    {
      title: 'Society Rules Reminder',
      description: 'Reminder: No loud music after 10pm. No parking in fire lanes. Garbage disposal only in designated bins. Thank you for cooperation.',
      category: FeedCategory.ANNOUNCEMENT, status: FeedStatus.ACTIVE,
      postedBy: admin._id,
      likes: [alice._id, bob._id],
    },
  ]);
  console.log('🛒 Community feed seeded (8)');

  // ── 8. PAYMENTS ────────────────────────────────────────────────────────────
  await Payment.insertMany([
    { resident: alice._id,   amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-04', status: PaymentStatus.PAID,    paidAt: new Date('2026-04-05'), recordedBy: admin._id },
    { resident: alice._id,   amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-05', status: PaymentStatus.PENDING,  recordedBy: admin._id },
    { resident: alice._id,   amount: 500,  description: 'Parking Fee',             month: '2026-05', status: PaymentStatus.PENDING,  recordedBy: admin._id },
    { resident: bob._id,     amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-04', status: PaymentStatus.PAID,    paidAt: new Date('2026-04-03'), recordedBy: admin._id },
    { resident: bob._id,     amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-05', status: PaymentStatus.OVERDUE,  recordedBy: admin._id },
    { resident: charlie._id, amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-04', status: PaymentStatus.PAID,    paidAt: new Date('2026-04-10'), recordedBy: admin._id },
    { resident: charlie._id, amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-05', status: PaymentStatus.PENDING,  recordedBy: admin._id },
    { resident: charlie._id, amount: 1500, description: 'Clubhouse Booking Fee',   month: '2026-04', status: PaymentStatus.PAID,    paidAt: new Date('2026-04-20'), recordedBy: admin._id },
    { resident: diana._id,   amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-04', status: PaymentStatus.PAID,    paidAt: new Date('2026-04-01'), recordedBy: admin._id },
    { resident: diana._id,   amount: 2500, description: 'Monthly Maintenance Fee', month: '2026-05', status: PaymentStatus.PENDING,  recordedBy: admin._id },
    { resident: diana._id,   amount: 300,  description: 'Water Usage Fee',         month: '2026-04', status: PaymentStatus.PAID,    paidAt: new Date('2026-04-15'), recordedBy: admin._id },
  ]);
  console.log('💳 Payments seeded (11)');

  // ── 9. COMPLAINTS ──────────────────────────────────────────────────────────
  await Complaint.insertMany([
    {
      title: 'Leaking pipe in bathroom',
      description: 'Water leak under the sink — ongoing for 3 days. Floor is wet and causing damage.',
      category: ComplaintCategory.MAINTENANCE, status: ComplaintStatus.IN_PROGRESS,
      raisedBy: alice._id, assignedTo: staffMgr._id,
    },
    {
      title: 'Loud music after midnight',
      description: 'Neighbor in B-205 plays loud music after midnight on weekdays. Very disturbing.',
      category: ComplaintCategory.NOISE, status: ComplaintStatus.OPEN,
      raisedBy: alice._id,
    },
    {
      title: 'Broken parking gate — east side',
      description: 'The parking gate on the east side is stuck open. Security risk.',
      category: ComplaintCategory.SECURITY, status: ComplaintStatus.RESOLVED,
      raisedBy: bob._id, assignedTo: guard1._id,
      resolution: 'Gate mechanism was repaired by the maintenance team on April 28th.',
    },
    {
      title: 'Garbage bins overflowing near Block B',
      description: 'Garbage bins near Block B have not been emptied for 2 days. Foul smell.',
      category: ComplaintCategory.CLEANLINESS, status: ComplaintStatus.OPEN,
      raisedBy: bob._id,
    },
    {
      title: 'Unauthorized vehicle in reserved parking',
      description: 'Unknown vehicle parked in my reserved spot #A-12 for 2 days. Plate: MH-04-XY-9999.',
      category: ComplaintCategory.PARKING, status: ComplaintStatus.CLOSED,
      raisedBy: alice._id,
      resolution: 'Vehicle owner was notified and moved the car.',
    },
    {
      title: 'Elevator out of service — Block C',
      description: 'Elevator in Block C has been out of service since yesterday. Elderly residents are struggling.',
      category: ComplaintCategory.MAINTENANCE, status: ComplaintStatus.IN_PROGRESS,
      raisedBy: charlie._id, assignedTo: staffMgr._id,
    },
    {
      title: 'Street lights not working near Gate 2',
      description: 'Three street lights near Gate 2 have been non-functional for a week. Safety concern at night.',
      category: ComplaintCategory.SECURITY, status: ComplaintStatus.OPEN,
      raisedBy: diana._id,
    },
  ]);
  console.log('📋 Complaints seeded (7)');

  // ── 10. ANNOUNCEMENTS ─────────────────────────────────────────────────────
  await Announcement.insertMany([
    {
      title: 'Water Supply Interruption — May 2nd',
      content: 'Water supply will be interrupted on May 2nd from 10am–2pm for pipeline maintenance. Please store water in advance. We apologize for the inconvenience.',
      postedBy: admin._id, isPinned: true,
    },
    {
      title: 'New Security Protocol — Effective May 1st',
      content: 'Starting May 1st, all visitors must register at the gate and receive a QR pass before entry. Delivery personnel must also be logged. Please inform your guests and domestic staff.',
      postedBy: admin._id, isPinned: true,
    },
    {
      title: 'Community BBQ — May 10th at 5pm',
      content: 'Join us for the annual community BBQ at the clubhouse lawn on May 10th at 5pm. Food, games, and fun for the whole family. RSVP via the Events section.',
      postedBy: admin._id, isPinned: false,
    },
    {
      title: 'Gym Renovation — Closed May 5–7',
      content: 'The fitness center will be closed from May 5th to May 7th for equipment upgrades. New treadmills and a yoga studio are being added. Thank you for your patience.',
      postedBy: admin._id, isPinned: false,
    },
    {
      title: 'Parking Allocation Update',
      content: 'Parking spots have been reallocated. Please check the notice board at the main gate for your new spot number. Any disputes should be raised with the admin office by May 5th.',
      postedBy: admin._id, isPinned: false,
    },
  ]);
  console.log('📢 Announcements seeded (5)');

  // ── 11. AMENITIES ─────────────────────────────────────────────────────────
  const [pool, gym, clubhouse, tennis, rooftop] = await Amenity.insertMany([
    { name: 'Swimming Pool',  description: 'Olympic-size pool with lap lanes and a leisure area. Towels provided.',    capacity: 30, isActive: true },
    { name: 'Fitness Center', description: 'Fully equipped gym with cardio machines, free weights, and yoga space.',   capacity: 20, isActive: true },
    { name: 'Clubhouse Hall', description: 'Multi-purpose hall for events and parties. Includes AV equipment and AC.', capacity: 100, isActive: true },
    { name: 'Tennis Court',   description: 'Two hard-surface courts with lighting for evening play.',                  capacity: 8,  isActive: true },
    { name: 'Rooftop Lounge', description: 'Open-air rooftop lounge with seating and city views.',                    capacity: 25, isActive: true },
  ]);
  console.log('🏊 Amenities seeded (5)');

  // ── 12. AMENITY BOOKINGS ──────────────────────────────────────────────────
  await AmenityBooking.insertMany([
    { amenity: pool._id,      bookedBy: alice._id,   date: daysAhead(1), timeSlot: '07:00-08:00', status: BookingStatus.APPROVED },
    { amenity: pool._id,      bookedBy: bob._id,     date: daysAhead(1), timeSlot: '08:00-09:00', status: BookingStatus.PENDING },
    { amenity: gym._id,       bookedBy: charlie._id, date: daysAhead(1), timeSlot: '06:00-07:00', status: BookingStatus.APPROVED },
    { amenity: gym._id,       bookedBy: diana._id,   date: daysAhead(2), timeSlot: '07:00-08:00', status: BookingStatus.PENDING },
    { amenity: clubhouse._id, bookedBy: alice._id,   date: daysAhead(7), timeSlot: '18:00-21:00', status: BookingStatus.PENDING },
    { amenity: tennis._id,    bookedBy: bob._id,     date: daysAhead(3), timeSlot: '17:00-18:00', status: BookingStatus.APPROVED },
    { amenity: rooftop._id,   bookedBy: charlie._id, date: daysAhead(5), timeSlot: '19:00-21:00', status: BookingStatus.PENDING },
    // Past booking
    { amenity: pool._id,      bookedBy: diana._id,   date: daysAgo(2),   timeSlot: '07:00-08:00', status: BookingStatus.APPROVED },
  ]);
  console.log('📅 Amenity bookings seeded (8)');

  // ── 13. EVENTS ────────────────────────────────────────────────────────────
  await Event.insertMany([
    {
      title: 'Community BBQ Night',
      location: 'Clubhouse Lawn',
      date: daysAhead(12),
      rsvpRequired: true,
      description: 'Annual community BBQ. Bring your family! Food, games, and live music.',
      createdBy: admin._id,
      rsvps: [alice._id, bob._id, charlie._id],
    },
    {
      title: 'Morning Yoga Session',
      location: 'Community Garden',
      date: daysAhead(5),
      rsvpRequired: false,
      description: 'Free morning yoga session open to all residents. Bring your own mat.',
      createdBy: admin._id,
      rsvps: [alice._id, diana._id],
    },
    {
      title: 'Quarterly Residents\' Meeting',
      location: 'Clubhouse Hall A',
      date: daysAhead(20),
      rsvpRequired: true,
      description: 'Discuss society budget, upcoming projects, and resident concerns.',
      createdBy: admin._id,
      rsvps: [alice._id, bob._id, charlie._id, diana._id],
    },
    {
      title: 'Kids\' Painting Workshop',
      location: 'Community Room B',
      date: daysAhead(8),
      rsvpRequired: true,
      description: 'A fun painting workshop for children aged 5–12. Materials provided.',
      createdBy: admin._id,
      rsvps: [alice._id],
    },
    {
      title: 'Diwali Celebration',
      location: 'Society Grounds',
      date: daysAhead(45),
      rsvpRequired: false,
      description: 'Annual Diwali celebration with rangoli, sweets, and fireworks display.',
      createdBy: admin._id,
      rsvps: [alice._id, bob._id, charlie._id, diana._id],
    },
  ]);
  console.log('🎉 Events seeded (5)');

  // ── 14. POLLS ─────────────────────────────────────────────────────────────
  await Poll.insertMany([
    {
      question: 'Should we extend pool hours to 10pm on weekends?',
      options: [
        { option: 'Yes, extend to 10pm', votes: 12 },
        { option: 'Keep current hours (8pm)', votes: 5 },
        { option: 'No preference', votes: 3 },
      ],
      endsAt: daysAhead(7),
      createdBy: admin._id,
      votedBy: [alice._id, bob._id],
    },
    {
      question: 'Which new amenity would you like added next?',
      options: [
        { option: 'Basketball Court', votes: 8 },
        { option: "Children's Play Area", votes: 15 },
        { option: 'Rooftop Garden', votes: 6 },
        { option: 'Co-working Space', votes: 10 },
      ],
      endsAt: daysAhead(14),
      createdBy: admin._id,
      votedBy: [alice._id, charlie._id, diana._id],
    },
    {
      question: 'Should we hire a full-time electrician for the society?',
      options: [
        { option: 'Yes, full-time', votes: 18 },
        { option: 'No, on-call is fine', votes: 7 },
      ],
      endsAt: daysAhead(3),
      createdBy: admin._id,
      votedBy: [bob._id, diana._id],
    },
    {
      question: 'Preferred timing for society maintenance work?',
      options: [
        { option: 'Weekday mornings (9am–12pm)', votes: 20 },
        { option: 'Weekday afternoons (2pm–5pm)', votes: 8 },
        { option: 'Weekends only', votes: 5 },
      ],
      endsAt: daysAgo(2), // already ended
      createdBy: admin._id,
      votedBy: [alice._id, bob._id, charlie._id, diana._id],
    },
  ]);
  console.log('🗳️  Polls seeded (4)');

  // ── 15. SOS ALERTS ────────────────────────────────────────────────────────
  await SOS.insertMany([
    {
      raisedBy: alice._id, unit: 'A-101',
      message: 'Suspicious person loitering near parking lot — please send security!',
      status: SOSStatus.ACTIVE,
    },
    {
      raisedBy: bob._id, unit: 'B-204',
      message: 'Medical emergency — elderly resident collapsed in corridor!',
      status: SOSStatus.RESOLVED,
      resolvedBy: guard1._id,
    },
    {
      raisedBy: charlie._id, unit: 'C-305',
      message: 'Fire alarm triggered in Block C — smoke visible near stairwell.',
      status: SOSStatus.RESOLVED,
      resolvedBy: guard2._id,
    },
    {
      raisedBy: diana._id, unit: 'D-402',
      message: 'Power outage in entire D block — lifts not working.',
      status: SOSStatus.ACTIVE,
    },
  ]);
  console.log('🚨 SOS alerts seeded (4)');

  // ── 16. NOTIFICATIONS ─────────────────────────────────────────────────────
  await Notification.insertMany([
    // Alice
    { user: alice._id, type: 'announcement', message: 'New announcement: Water Supply Interruption on May 2nd', read: false },
    { user: alice._id, type: 'visitor',      message: 'Your visitor John Doe is scheduled for tomorrow', read: false },
    { user: alice._id, type: 'delivery',     message: 'New delivery from Zomato is awaiting your approval', read: false },
    { user: alice._id, type: 'payment',      message: 'Payment reminder: Maintenance fee for May 2026 is due', read: true },
    { user: alice._id, type: 'complaint',    message: 'Your complaint "Unauthorized parking" has been resolved', read: true },
    // Bob
    { user: bob._id,   type: 'announcement', message: 'New announcement: New Security Protocol starting May 1st', read: false },
    { user: bob._id,   type: 'payment',      message: 'OVERDUE: Maintenance fee for May 2026 is overdue. Please pay immediately.', read: false },
    { user: bob._id,   type: 'complaint',    message: 'Your complaint "Broken parking gate" has been resolved', read: true },
    { user: bob._id,   type: 'visitor',      message: 'Your visitor Priya Sharma has been approved', read: false },
    // Charlie
    { user: charlie._id, type: 'complaint',  message: 'Your complaint "Elevator out of service" is now In Progress', read: false },
    { user: charlie._id, type: 'announcement', message: 'Gym will be closed May 5–7 for renovation', read: false },
    { user: charlie._id, type: 'payment',    message: 'Payment reminder: Maintenance fee for May 2026 is due', read: false },
    // Diana
    { user: diana._id, type: 'sos',          message: 'Your SOS alert (Power outage D-402) has been received by security', read: false },
    { user: diana._id, type: 'announcement', message: 'Parking allocation has been updated — check notice board', read: false },
    // Guard
    { user: guard1._id, type: 'sos',         message: 'SOS Alert from Unit A-101: Suspicious person near parking lot!', read: false },
    { user: guard1._id, type: 'sos',         message: 'SOS Alert from Unit D-402: Power outage in D block!', read: false },
    { user: guard2._id, type: 'visitor',     message: 'New visitor pending OTP verification: John Doe for Unit A-101', read: false },
  ]);
  console.log('🔔 Notifications seeded (17)');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ All seed data inserted successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  👑 Superuser:  super@gateapp.com    / Super@123');
  console.log('  🛡️  Admin:      admin@gateapp.com    / Admin@123');
  console.log('  🏠 Resident:   alice@gateapp.com    / Alice@123   (Unit A-101)');
  console.log('  🏠 Resident:   bob@gateapp.com      / Bob@123     (Unit B-204)');
  console.log('  🏠 Resident:   charlie@gateapp.com  / Charlie@123 (Unit C-305)');
  console.log('  🏠 Resident:   diana@gateapp.com    / Diana@123   (Unit D-402)');
  console.log('  🔒 Security:   carlos@gateapp.com   / Guard@123');
  console.log('  🔒 Security:   ravi@gateapp.com     / Guard@123');
  console.log('  👷 Staff:      priya@gateapp.com    / Staff@123');
  console.log('\n📊 Seeded Collections:');
  console.log('  Users: 9 | Visitors: 8 | Deliveries: 6 | Staff: 5');
  console.log('  AttendanceLogs: 6 | GateLogs: 12 | CommunityFeed: 8');
  console.log('  Payments: 11 | Complaints: 7 | Announcements: 5');
  console.log('  Amenities: 5 | Bookings: 8 | Events: 5 | Polls: 4');
  console.log('  SOS: 4 | Notifications: 17');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
