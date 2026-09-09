const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch(e){}
require('dotenv').config();

async function testPaymentProofLive() {
  console.log('Testing live payment proof submission to support email...');

  // Sample 1x1 base64 transparent PNG to simulate proof of payment image
  const sampleProofBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const payload = {
    from: 'SourceDeliveryPro <support@sourcedeliverypro.com>',
    to: ['support@sourcedeliverypro.com'],
    subject: '🚨 New Payment Proof: SDP-LIVE-9921 ($450.00 - Zelle)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #1B2A4A; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0;">SourceDeliveryPro</h2>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Payment Proof Submission</p>
        </div>
        <div style="padding: 24px;">
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 14px; border-radius: 4px; margin-bottom: 20px;">
            <strong style="color: #92400E;">🚨 Payment Proof Uploaded</strong>
            <p style="color: #B45309; margin: 4px 0 0; font-size: 13px;">A customer has submitted proof of payment for verification.</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Tracking Reference:</strong> <span style="font-family: monospace; font-size: 16px; color: #6B2737; font-weight: bold;">SDP-LIVE-9921</span></p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> <span style="color: #059669; font-weight: bold;">$450.00</span></p>
            <p style="margin: 4px 0;"><strong>Payment Method:</strong> Zelle (Instant Transfer)</p>
            <p style="margin: 4px 0;"><strong>Payer Full Name:</strong> David Miller</p>
            <p style="margin: 4px 0;"><strong>Transaction Reference:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">#ZLL-882910381</code></p>
            <p style="margin: 4px 0;"><strong>Customer Memo:</strong> Chase Zelle transfer completed</p>
          </div>

          <p style="font-size: 13px; color: #6b7280;">The proof receipt has also been attached to this email.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sourcedeliverypro.com'}/admin/payments" style="display: inline-block; background: #6B2737; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 12px;">Review in Admin Panel</a>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'payment-proof-SDP-LIVE-9921.png',
        content: sampleProofBase64,
      },
    ],
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'HTTP ' + res.status);
  }

  console.log('✅ PAYMENT PROOF EMAIL SUCCESSFULLY DISPATCHED TO SUPPORT!');
  console.log('   Delivery ID:', data.id);
}

testPaymentProofLive().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
