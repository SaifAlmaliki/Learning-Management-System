"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = exports.createStripePaymentIntent = exports.listTransactions = void 0;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const userCourseProgressModel_1 = __importDefault(require("../models/userCourseProgressModel"));
// Load environment variables
dotenv_1.default.config();
// Ensure Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required but was not found in environment variables.");
}
// Initialize Stripe with the secret key
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
/**
 * @function listTransactions
 * @description Retrieves all transactions or filters them by a specific user ID.
 * @route GET /api/transactions
 * @queryParam {string} userId - Optional: Filter transactions by a specific user ID.
 */
const listTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    try {
        // Retrieve transactions based on user ID filter or all transactions
        const transactions = userId
            ? yield transactionModel_1.default.query("userId").eq(userId).exec()
            : yield transactionModel_1.default.scan().exec();
        res.json({
            message: "Transactions retrieved successfully",
            data: transactions,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving transactions",
            error,
        });
    }
});
exports.listTransactions = listTransactions;
/**
 * @function createStripePaymentIntent
 * @description Creates a Stripe Payment Intent to handle payment securely.
 * @route POST /api/stripe/payment-intent
 * @bodyParam {number} amount - The amount to be paid (in USD cents). Defaults to 50 if not provided or invalid.
 */
const createStripePaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { amount } = req.body;
    // Ensure the amount is valid; set a default value if invalid
    if (!amount || amount <= 0) {
        amount = 50; // Default amount: 50 cents
    }
    try {
        // Create a Payment Intent with Stripe
        const paymentIntent = yield stripe.paymentIntents.create({
            amount, // Amount in cents
            currency: "usd", // Payment currency
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });
        res.json({
            message: "Payment intent created successfully",
            data: {
                clientSecret: paymentIntent.client_secret,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error creating Stripe payment intent",
            error,
        });
    }
});
exports.createStripePaymentIntent = createStripePaymentIntent;
/**
 * @function createTransaction
 * @description Handles course purchase, creates transaction records, initializes course progress, and updates enrollments.
 * @route POST /api/transactions
 * @bodyParam {string} userId - The ID of the user purchasing the course.
 * @bodyParam {string} courseId - The ID of the course being purchased.
 * @bodyParam {string} transactionId - The ID of the Stripe transaction.
 * @bodyParam {number} amount - The payment amount.
 * @bodyParam {string} paymentProvider - The payment provider (e.g., Stripe).
 */
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId, transactionId, amount, paymentProvider } = req.body;
    try {
        // 1. Fetch course details
        const course = yield courseModel_1.default.get(courseId);
        // 2. Create a new transaction record
        const newTransaction = new transactionModel_1.default({
            dateTime: new Date().toISOString(),
            userId,
            courseId,
            transactionId,
            amount,
            paymentProvider,
        });
        yield newTransaction.save();
        // 3. Initialize user's course progress
        const initialProgress = new userCourseProgressModel_1.default({
            userId,
            courseId,
            enrollmentDate: new Date().toISOString(),
            overallProgress: 0,
            sections: course.sections.map((section) => ({
                sectionId: section.sectionId,
                chapters: section.chapters.map((chapter) => ({
                    chapterId: chapter.chapterId,
                    completed: false,
                })),
            })),
            lastAccessedTimestamp: new Date().toISOString(),
        });
        yield initialProgress.save();
        // 4. Update the course to reflect the new enrollment
        yield courseModel_1.default.update({ courseId }, {
            $ADD: {
                enrollments: [{ userId }],
            },
        });
        res.json({
            message: "Purchased course successfully",
            data: {
                transaction: newTransaction,
                courseProgress: initialProgress,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error creating transaction and initializing enrollment",
            error,
        });
    }
});
exports.createTransaction = createTransaction;
