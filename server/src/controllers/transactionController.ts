import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

// Load environment variables
dotenv.config();

// Ensure Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is required but was not found in environment variables."
  );
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @function listTransactions
 * @description Retrieves all transactions or filters them by a specific user ID.
 * @route GET /api/transactions
 * @queryParam {string} userId - Optional: Filter transactions by a specific user ID.
 */
export const listTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.query;

  try {
    // Retrieve transactions based on user ID filter or all transactions
    const transactions = userId
      ? await Transaction.query("userId").eq(userId).exec()
      : await Transaction.scan().exec();

    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving transactions",
      error,
    });
  }
};

/**
 * @function createStripePaymentIntent
 * @description Creates a Stripe Payment Intent to handle payment securely.
 * @route POST /api/stripe/payment-intent
 * @bodyParam {number} amount - The amount to be paid (in USD cents). Defaults to 50 if not provided or invalid.
 */
export const createStripePaymentIntent = async (req: Request, res: Response): Promise<void> => {
  let { amount } = req.body;

  // Ensure the amount is valid; set a default value if invalid
  if (!amount || amount <= 0) {
    amount = 50; // Default amount: 50 cents
  }

  try {
    // Create a Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,           // Amount in cents
      currency: "usd",  // Payment currency
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
  } catch (error) {
    res.status(500).json({
      message: "Error creating Stripe payment intent",
      error,
    });
  }
};

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
export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  try {
    // 1. Fetch course details
    const course = await Course.get(courseId);

    // 2. Create a new transaction record
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();

    // 3. Initialize user's course progress
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    await initialProgress.save();

    // 4. Update the course to reflect the new enrollment
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    );

    res.json({
      message: "Purchased course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating transaction and initializing enrollment",
      error,
    });
  }
};
