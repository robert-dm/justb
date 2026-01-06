const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    // Verify booking belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: bookingId,
        userId: req.user.id
      }
    });

    // Store payment intent ID in booking
    booking.payment.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking payment status
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.payment.status = 'completed';
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        booking
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update booking status
      const booking = await Booking.findOne({
        'payment.stripePaymentIntentId': paymentIntent.id
      });

      if (booking) {
        booking.payment.status = 'completed';
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      // Update booking status
      const failedBooking = await Booking.findOne({
        'payment.stripePaymentIntentId': failedPayment.id
      });

      if (failedBooking) {
        failedBooking.payment.status = 'failed';
        await failedBooking.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
