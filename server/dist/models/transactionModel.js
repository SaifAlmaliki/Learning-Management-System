"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoose_1 = require("dynamoose"); // Importing Dynamoose for schema and model creation
/**
 * Schema for tracking individual transactions.
 * Fields:
 *   - userId: Unique identifier for the user (hash key).
 *   - transactionId: Unique identifier for the transaction (range key).
 *   - dateTime: Timestamp of when the transaction occurred.
 *   - courseId: Unique identifier for the course associated with the transaction.
 *       - Indexed using a global secondary index for efficient querying by courseId.
 *   - paymentProvider: Payment method used for the transaction (e.g., 'stripe').
 *       - Limited to the specified enum values.
 *   - amount: Transaction amount in numeric format.
 *
 * Options:
 *   - `saveUnknown: true`: Allows saving fields not explicitly defined in the schema.
 *   - `timestamps: true`: Automatically adds createdAt and updatedAt fields.
 */
const transactionSchema = new dynamoose_1.Schema({
    userId: {
        type: String,
        hashKey: true, // Partition key for DynamoDB
        required: true,
    },
    transactionId: {
        type: String,
        rangeKey: true, // Sort key for DynamoDB
        required: true,
    },
    dateTime: {
        type: String,
        required: true,
    },
    courseId: {
        type: String,
        required: true,
        index: {
            name: "CourseTransactionsIndex", // Name of the global secondary index
            type: "global", // Global index allows queries across all partitions
        },
    },
    paymentProvider: {
        type: String,
        enum: ["stripe"], // Restricts values to the specified payment providers
        required: true,
    },
    amount: Number, // Numeric value representing the transaction amount
}, {
    saveUnknown: true, // Allows saving fields not defined in the schema
    timestamps: true, // Adds createdAt and updatedAt timestamps
});
/**
 * Dynamoose model for transaction records.
 * Table Name: "Transaction"
 */
const Transaction = (0, dynamoose_1.model)("Transaction", transactionSchema);
exports.default = Transaction;
