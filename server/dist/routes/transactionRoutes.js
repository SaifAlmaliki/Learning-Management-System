"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file defines routes for handling transactions and Stripe payment intents in the application
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
// Initialize the Express router
const router = express_1.default.Router();
// ======================== Route Definitions ========================
// GET /
// Retrieves a list of all transactions.
// - Controller: listTransactions
router.get("/", transactionController_1.listTransactions);
// POST /
// Creates a new transaction.
// - Controller: createTransaction
router.post("/", transactionController_1.createTransaction);
// POST /stripe/payment-intent
// Creates a Stripe payment intent to initiate a payment session.
// This route is used to integrate Stripe payments.
// - Controller: createStripePaymentIntent
router.post("/stripe/payment-intent", transactionController_1.createStripePaymentIntent);
// ======================== Export the Router ========================
// Export the configured router to be used in the main application
exports.default = router;
