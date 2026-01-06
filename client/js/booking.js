// Booking-related helper functions

// Initialize Stripe (will be set when needed)
let stripe = null;

function initializeStripe() {
  if (!stripe && window.Stripe) {
    // Get publishable key from environment or use placeholder
    stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
  }
  return stripe;
}

// Create a payment session
async function createPaymentSession(bookingId, amount) {
  try {
    const data = await apiRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        amount
      })
    });

    return data;
  } catch (error) {
    console.error('Error creating payment session:', error);
    throw error;
  }
}

// Confirm payment
async function confirmPayment(paymentIntentId, bookingId) {
  try {
    const data = await apiRequest('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId,
        bookingId
      })
    });

    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

// Get booking status badge
function getBookingStatusBadge(status) {
  const statusMap = {
    'pending': 'badge-warning',
    'confirmed': 'badge-info',
    'preparing': 'badge-info',
    'on-the-way': 'badge-info',
    'delivered': 'badge-success',
    'completed': 'badge-success',
    'cancelled': 'badge-danger'
  };

  const badgeClass = statusMap[status] || 'badge-info';
  return `<span class="badge ${badgeClass}">${status.replace('-', ' ').toUpperCase()}</span>`;
}

// Get payment status badge
function getPaymentStatusBadge(status) {
  const statusMap = {
    'pending': 'badge-warning',
    'completed': 'badge-success',
    'failed': 'badge-danger',
    'refunded': 'badge-info'
  };

  const badgeClass = statusMap[status] || 'badge-warning';
  return `<span class="badge ${badgeClass}">${status.toUpperCase()}</span>`;
}
