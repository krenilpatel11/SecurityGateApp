
function ISODate(dateString: string): Date {
  return new Date(dateString);
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import deliveryModel from '../models/delivery.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function seedDeliveries() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await deliveryModel.deleteMany({});

  await deliveryModel.insertMany([
  {
    "resident": '687aa555ea9437789981b19f',
    "deliveryPerson": "Ravi Kumar",
    "deliveryCompany": "Flipkart",
    "purpose": "Online Shopping",
    "items": "1x Headphones",
    "status": "Pending",
    "requestedAt": ISODate("2024-07-21T09:30:00Z")
  },
  {
    "resident": '687aa555ea9437789981b19f',
    "deliveryPerson": "Sanjay Patil",
    "deliveryCompany": "Amazon",
    "purpose": "Online Shopping",
    "items": "1x Book",
    "status": "Completed",
    "requestedAt": ISODate("2024-07-18T14:00:00Z"),
    "completedAt": ISODate("2024-07-18T15:00:00Z")
  },
  {
    "resident": '687aa555ea9437789981b19f',
    "deliveryPerson": "Deepa Sharma",
    "deliveryCompany": "Dunzo",
    "purpose": "Groceries",
    "items": "2x Milk, 1x Bread",
    "status": "Left at Gate",
    "requestedAt": ISODate("2024-07-19T18:30:00Z"),
    "photoUrl": "https://yourapp.com/photos/delivery1.jpg",
    "leftAtGateReason": "Resident not at home"
  }
]);

  console.log('Dummy deliveries seeded!');
  await mongoose.disconnect();
}

seedDeliveries().catch(err => {
  console.error(err);
  process.exit(1);
});
