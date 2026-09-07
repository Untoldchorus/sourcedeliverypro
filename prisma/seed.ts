import { PrismaClient, UserRole, ShipmentStatus, ServiceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding SourceDeliveryPro database...')

  // Clean old records
  await prisma.trackingEvent.deleteMany()
  await prisma.proofOfDelivery.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.user.deleteMany()

  // 1. Password hashes
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const customerPassword = await bcrypt.hash('Customer123!', 12)
  const driverPassword = await bcrypt.hash('Driver123!', 12)

  // 2. Users
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Global Operations Admin',
      email: 'admin@sourcedeliverypro.com',
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })

  const driverUser = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'driver@sourcedeliverypro.com',
      phone: '+1 555-0182',
      passwordHash: driverPassword,
      role: UserRole.DRIVER,
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      name: 'John Carter',
      email: 'john@example.com',
      phone: '+1 555-0199',
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
    },
  })

  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      customerNumber: 'CST-8829104',
      companyName: 'Carter International Goods',
    },
  })

  // 3. Driver & Vehicle
  const driver = await prisma.driver.create({
    data: {
      userId: driverUser.id,
      employeeNumber: 'DRV-1004',
      rating: 4.95,
      totalDeliveries: 342,
    },
  })

  await prisma.vehicle.create({
    data: {
      driverId: driver.id,
      type: 'Sprinter Cargo Van',
      make: 'Mercedes-Benz',
      model: 'Sprinter 2500',
      year: 2024,
      plateNumber: 'SDP-09',
    },
  })

  // 4. Facilities
  const jfkFacility = await prisma.facility.create({
    data: {
      facilityCode: 'NYC-HUB-01',
      name: 'New York JFK International Air Hub',
      addressLine1: 'Bldg 141 Cargo Area, JFK Airport',
      city: 'Jamaica',
      state: 'NY',
      country: 'US',
      postalCode: '11430',
      latitude: 40.6413,
      longitude: -73.7781,
    },
  })

  const lhrFacility = await prisma.facility.create({
    data: {
      facilityCode: 'LON-HUB-02',
      name: 'London Heathrow Gateway Logistics Center',
      addressLine1: 'Unit 4 Scylla Rd, Heathrow Airport',
      city: 'Hounslow',
      country: 'GB',
      postalCode: 'TW6 3FE',
      latitude: 51.4700,
      longitude: -0.4543,
    },
  })

  // 5. Sample Shipments & Tracking Events
  // Shipment 1: In Transit
  const shipment1 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-20260905-88A91',
      trackingNumber: 'SDP8F4K92LM381',
      status: ShipmentStatus.IN_TRANSIT,
      serviceType: ServiceType.INTERNATIONAL_EXPRESS,
      senderName: 'John Carter',
      senderCompany: 'Carter International Goods',
      senderEmail: 'john@example.com',
      senderPhone: '+1 555-0199',
      senderAddressLine1: '450 Logistics Blvd',
      senderCity: 'New York',
      senderState: 'NY',
      senderCountry: 'US',
      senderPostalCode: '10001',
      recipientName: 'Sarah Jenkins',
      recipientCompany: 'Global Imports Ltd',
      recipientEmail: 'sarah.jenkins@example.co.uk',
      recipientPhone: '+44 20 7946 0991',
      recipientAddressLine1: '12 Canary Wharf, Floor 4',
      recipientCity: 'London',
      recipientCountry: 'GB',
      recipientPostalCode: 'E14 5AB',
      weight: 3.5,
      length: 35,
      width: 25,
      height: 15,
      dimensionalWeight: 2.625,
      chargeableWeight: 3.5,
      contents: 'Electronic telemetry and engineering prototypes',
      declaredValue: 450,
      baseRate: 157.5,
      fuelSurcharge: 19.69,
      taxAmount: 13.29,
      totalAmount: 190.48,
      currency: 'USD',
      estimatedDelivery: new Date(Date.now() + 86400000 * 2),
      customerId: customer.id,
    },
  })

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: shipment1.id,
        status: ShipmentStatus.LABEL_CREATED,
        description: 'Electronic shipping manifest transmitted and label created.',
        city: 'New York',
        country: 'US',
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        shipmentId: shipment1.id,
        status: ShipmentStatus.PICKED_UP,
        description: 'Consignment received by courier driver at sender dock.',
        city: 'New York',
        country: 'US',
        timestamp: new Date(Date.now() - 86400000 * 1.5),
      },
      {
        shipmentId: shipment1.id,
        status: ShipmentStatus.ARRIVED_AT_FACILITY,
        facilityId: jfkFacility.id,
        facilityName: jfkFacility.name,
        description: 'Sorted at JFK Air Hub and loaded onto freighter container.',
        city: 'Jamaica',
        country: 'US',
        timestamp: new Date(Date.now() - 86400000 * 1),
      },
      {
        shipmentId: shipment1.id,
        status: ShipmentStatus.IN_TRANSIT,
        description: 'Flight departed New York JFK en route to London Heathrow.',
        city: 'In Flight',
        country: 'International Airspace',
        timestamp: new Date(Date.now() - 3600000 * 4),
      },
    ],
  })

  // Shipment 2: Delivered with POD
  const shipment2 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-20260901-77B21',
      trackingNumber: 'SDP77B219KP440',
      status: ShipmentStatus.DELIVERED,
      serviceType: ServiceType.STANDARD,
      senderName: 'Michael Chang',
      senderEmail: 'michael@changimports.com',
      senderPhone: '+1 555-0812',
      senderAddressLine1: '88 Tech Way',
      senderCity: 'San Francisco',
      senderState: 'CA',
      senderCountry: 'US',
      recipientName: 'David Miller',
      recipientEmail: 'david@millerfirm.ca',
      recipientAddressLine1: '450 Bay St',
      recipientCity: 'Toronto',
      recipientCountry: 'CA',
      weight: 1.8,
      baseRate: 45.0,
      totalAmount: 52.5,
      actualDelivery: new Date(),
    },
  })

  await prisma.proofOfDelivery.create({
    data: {
      shipmentId: shipment2.id,
      driverId: driver.id,
      recipientName: 'David Miller',
      deliveredAt: new Date(),
      notes: 'Signed and left at corporate mailroom.',
    },
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })