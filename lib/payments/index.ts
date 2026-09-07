export type PaymentProvider = 'paystack' | 'stripe' | 'flutterwave' | 'simulation'

export interface InitiatePaymentParams {
  amount: number // in major currency unit (USD, NGN, etc.)
  currency: string
  email: string
  reference: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
  provider?: PaymentProvider
}

export interface PaymentInitResult {
  success: boolean
  authorizationUrl?: string
  reference?: string
  accessCode?: string
  error?: string
}

export interface VerifyPaymentParams {
  reference: string
  provider: PaymentProvider
}

export interface PaymentVerifyResult {
  success: boolean
  status: 'paid' | 'failed' | 'pending'
  amount?: number
  currency?: string
  paidAt?: Date
  error?: string
  providerResponse?: unknown
}

/**
 * Initiates a payment with the given provider.
 * Defaults to simulation in development.
 */
export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<PaymentInitResult> {
  const provider = params.provider ?? detectProvider(params.currency)

  if (provider === 'simulation' || process.env.NEXT_PUBLIC_ENABLE_PAYMENT_SIMULATION === 'true') {
    return simulatePaymentInit(params)
  }

  switch (provider) {
    case 'paystack':
      return initiatePaystackPayment(params)
    case 'stripe':
      return initiateStripePayment(params)
    case 'flutterwave':
      return initiateFlutterwavePayment(params)
    default:
      return { success: false, error: 'Unsupported payment provider' }
  }
}

/**
 * Verifies a payment with the given provider.
 */
export async function verifyPayment(
  params: VerifyPaymentParams
): Promise<PaymentVerifyResult> {
  if (params.provider === 'simulation' || process.env.NEXT_PUBLIC_ENABLE_PAYMENT_SIMULATION === 'true') {
    return simulatePaymentVerify(params.reference)
  }

  switch (params.provider) {
    case 'paystack':
      return verifyPaystackPayment(params.reference)
    case 'stripe':
      return verifyStripePayment(params.reference)
    case 'flutterwave':
      return verifyFlutterwavePayment(params.reference)
    default:
      return { success: false, status: 'failed', error: 'Unsupported payment provider' }
  }
}

/**
 * Detect the best provider based on currency
 */
function detectProvider(currency: string): PaymentProvider {
  const upperCurrency = currency.toUpperCase()
  if (upperCurrency === 'NGN') return 'paystack'
  if (upperCurrency === 'USD' || upperCurrency === 'EUR' || upperCurrency === 'GBP') return 'stripe'
  return 'flutterwave'
}

// ========== SIMULATION ==========
async function simulatePaymentInit(params: InitiatePaymentParams): Promise<PaymentInitResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return {
    success: true,
    authorizationUrl: `${appUrl}/payment/simulate?ref=${params.reference}&amount=${params.amount}&currency=${params.currency}`,
    reference: params.reference,
  }
}

async function simulatePaymentVerify(reference: string): Promise<PaymentVerifyResult> {
  return {
    success: true,
    status: 'paid',
    paidAt: new Date(),
    providerResponse: { simulated: true, reference },
  }
}

// ========== PAYSTACK ==========
async function initiatePaystackPayment(params: InitiatePaymentParams): Promise<PaymentInitResult> {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amount * 100), // Paystack uses kobo
        currency: params.currency,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    })
    const data = (await response.json()) as {
      status: boolean
      data?: { authorization_url: string; reference: string; access_code: string }
      message?: string
    }
    if (!data.status || !data.data) {
      return { success: false, error: data.message ?? 'Paystack initialization failed' }
    }
    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Paystack error' }
  }
}

async function verifyPaystackPayment(reference: string): Promise<PaymentVerifyResult> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const data = (await response.json()) as {
      status: boolean
      data?: { status: string; amount: number; currency: string; paid_at: string }
    }
    if (!data.status || !data.data) return { success: false, status: 'failed', error: 'Verification failed' }

    const txn = data.data
    return {
      success: txn.status === 'success',
      status: txn.status === 'success' ? 'paid' : 'failed',
      amount: txn.amount / 100,
      currency: txn.currency,
      paidAt: txn.paid_at ? new Date(txn.paid_at) : undefined,
      providerResponse: data,
    }
  } catch (err) {
    return { success: false, status: 'failed', error: err instanceof Error ? err.message : 'Paystack verify error' }
  }
}

// ========== STRIPE ==========
async function initiateStripePayment(params: InitiatePaymentParams): Promise<PaymentInitResult> {
  // Stripe requires server-side SDK - this is a placeholder for the actual implementation
  // In production, you would use: import Stripe from 'stripe'
  return {
    success: false,
    error: 'Stripe integration requires STRIPE_SECRET_KEY to be configured',
  }
}

async function verifyStripePayment(reference: string): Promise<PaymentVerifyResult> {
  return { success: false, status: 'failed', error: 'Stripe verify not configured' }
}

// ========== FLUTTERWAVE ==========
async function initiateFlutterwavePayment(params: InitiatePaymentParams): Promise<PaymentInitResult> {
  try {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: params.reference,
        amount: params.amount,
        currency: params.currency,
        redirect_url: params.callbackUrl,
        customer: { email: params.email },
        meta: params.metadata,
      }),
    })
    const data = (await response.json()) as {
      status: string
      data?: { link: string }
      message?: string
    }
    if (data.status !== 'success' || !data.data) {
      return { success: false, error: data.message ?? 'Flutterwave init failed' }
    }
    return { success: true, authorizationUrl: data.data.link, reference: params.reference }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Flutterwave error' }
  }
}

async function verifyFlutterwavePayment(reference: string): Promise<PaymentVerifyResult> {
  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    )
    const data = (await response.json()) as {
      status: string
      data?: { status: string; amount: number; currency: string; created_at: string }
    }
    if (data.status !== 'success' || !data.data) {
      return { success: false, status: 'failed', error: 'Verification failed' }
    }
    const txn = data.data
    return {
      success: txn.status === 'successful',
      status: txn.status === 'successful' ? 'paid' : 'failed',
      amount: txn.amount,
      currency: txn.currency,
      paidAt: txn.created_at ? new Date(txn.created_at) : undefined,
      providerResponse: data,
    }
  } catch (err) {
    return { success: false, status: 'failed', error: err instanceof Error ? err.message : 'Flutterwave verify error' }
  }
}