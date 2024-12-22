// This file defines routes for handling transactions and Stripe payment intents in the application
import express from "express";
import {
  createStripePaymentIntent,
  createTransaction,
  listTransactions,
} from "../controllers/transactionController";

// Initialize the Express router
const router = express.Router();

// ======================== Route Definitions ========================

// GET /
// Retrieves a list of all transactions.
// - Controller: listTransactions
router.get("/", listTransactions);

// POST /
// Creates a new transaction.
// - Controller: createTransaction
router.post("/", createTransaction);

// POST /stripe/payment-intent
// Creates a Stripe payment intent to initiate a payment session.
// This route is used to integrate Stripe payments.
// - Controller: createStripePaymentIntent
router.post("/stripe/payment-intent", createStripePaymentIntent);

// ======================== Export the Router ========================
// Export the configured router to be used in the main application
export default router;
