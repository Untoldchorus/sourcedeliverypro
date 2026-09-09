const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch(e){}
require('dotenv').config();

async function sendResendMail(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'HTTP ' + res.status);
  }
  return data;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 LIVE VERIFICATION TEST: SourceDeliveryPro Mailer');
  console.log('====================================================');
  console.log('Recipient: support@sourcedeliverypro.com');
  console.log('Sender:    support@sourcedeliverypro.com\n');

  // Test 1: Shipment Notification
  console.log('[1/2] Sending Live Shipment Confirmation Email...');
  const shipData = await sendResendMail({
    from: 'SourceDeliveryPro <support@sourcedeliverypro.com>',
    to: ['support@sourcedeliverypro.com'],
    subject: '📦 Shipment Confirmed — SDP-882910',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #1B2A4A; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0;">SourceDeliveryPro</h2>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Shipment Confirmation Notice</p>
        </div>
        <div style="padding: 24px;">
          <h3 style="color: #1B2A4A; margin-top: 0;">Your Shipment is Confirmed! 📦</h3>
          <p style="color: #4b5563; font-size: 14px;">Your shipment has been registered and is scheduled for dispatch.</p>
          <div style="background: #f8fafc; border-left: 4px solid #6B2737; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 15px; color: #6B2737;">SDP-882910</span></p>
            <p style="margin: 4px 0;"><strong>Recipient:</strong> John Doe</p>
            <p style="margin: 4px 0;"><strong>Destination:</strong> London, UK</p>
            <p style="margin: 4px 0;"><strong>Service:</strong> International Priority Express</p>
            <p style="margin: 4px 0;"><strong>Estimated Delivery:</strong> 2-3 Business Days</p>
          </div>
          <p style="font-size: 12px; color: #9ca3af;">Delivered via verified SourceDeliveryPro mail infrastructure.</p>
        </div>
      </div>
    `,
  });
  console.log('✅ Shipment Confirmation Email Delivered!');
  console.log('   Delivery ID:', shipData.id);

  // Test 2: Welcome / Account Setup Notification
  console.log('\n[2/2] Sending Live Welcome Notification Email...');
  const welcomeData = await sendResendMail({
    from: 'SourceDeliveryPro <support@sourcedeliverypro.com>',
    to: ['support@sourcedeliverypro.com'],
    subject: '👋 Welcome to SourceDeliveryPro — Account Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #1B2A4A; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0;">SourceDeliveryPro</h2>
        </div>
        <div style="padding: 24px;">
          <h3 style="color: #1B2A4A; margin-top: 0;">Welcome aboard! 🚀</h3>
          <p style="color: #4b5563; font-size: 14px;">Your account is fully activated. Automated notifications and customer tracking receipts are live.</p>
        </div>
      </div>
    `,
  });
  console.log('✅ Welcome Notification Email Delivered!');
  console.log('   Delivery ID:', welcomeData.id);

  console.log('\n====================================================');
  console.log('🎉 ALL LIVE EMAIL SERVICES ARE VERIFIED AND WORKING!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
