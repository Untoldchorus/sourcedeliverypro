import { sendShipmentConfirmationEmail, sendWelcomeEmail } from '../lib/email'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('Testing sendShipmentConfirmationEmail()...')
  const res1 = await sendShipmentConfirmationEmail(
    'support@sourcedeliverypro.com',
    'SDP-992011',
    'SHP-4001',
    'Jane Doe',
    'Friday, Sep 12'
  )
  console.log('Shipment Email Response:', res1)

  console.log('\nTesting sendWelcomeEmail()...')
  const res2 = await sendWelcomeEmail('support@sourcedeliverypro.com', 'Alexander')
  console.log('Welcome Email Response:', res2)

  if (res1.success && res2.success) {
    console.log('\n✅ ALL APPLICATION EMAIL FUNCTIONS PASSED TEST!')
    process.exit(0)
  } else {
    console.error('\n❌ Test failed!')
    process.exit(1)
  }
}

main()
