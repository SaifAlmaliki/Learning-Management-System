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
exports.default = seed;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dynamoose_1 = __importDefault(require("dynamoose"));
const pluralize_1 = __importDefault(require("pluralize"));
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const userCourseProgressModel_1 = __importDefault(require("../models/userCourseProgressModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/** Determines if we run locally (DynamoDB Local) or in production (AWS DynamoDB). */
const isProduction = process.env.NODE_ENV === "production";
/**
 * Global DynamoDBClient instance.
 * In local mode, points to "http://localhost:8001".
 * In production mode, uses AWS region "eu-central-1" (or from process.env).
 */
let client;
if (!isProduction) {
    // Use DynamoDB Local
    dynamoose_1.default.aws.ddb.local();
    client = new client_dynamodb_1.DynamoDBClient({
        endpoint: "http://localhost:8000",
        region: "eu-central-1",
        credentials: {
            accessKeyId: "dummyKey123",
            secretAccessKey: "dummyKey123",
        },
    });
}
else {
    // Use AWS DynamoDB in "eu-central-1" (or an AWS_REGION env variable)
    client = new client_dynamodb_1.DynamoDBClient({
        region: process.env.AWS_REGION || "eu-central-1",
    });
}
/**
 * Suppresses some local DynamoDB tagging warnings in the console.
 * These often appear when running DynamoDB Local.
 */
const originalWarn = console.warn.bind(console);
console.warn = (message, ...args) => {
    if (!message.includes("Tagging is not currently supported in DynamoDB Local")) {
        originalWarn(message, ...args);
    }
};
/**
 * Create and initialize tables for the specified Dynamoose models.
 * Waits briefly before table initialization to avoid race conditions.
 */
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const models = [transactionModel_1.default, userCourseProgressModel_1.default, courseModel_1.default];
        for (const model of models) {
            const tableName = model.name; // e.g. "Transaction"
            const table = new dynamoose_1.default.Table(tableName, [model], {
                create: true,
                update: true,
                waitForActive: true,
                throughput: { read: 5, write: 5 },
            });
            try {
                // Short pause before initialization to ensure readiness
                yield new Promise((resolve) => setTimeout(resolve, 2000));
                yield table.initialize();
                console.log(`Table created and initialized: ${tableName}`);
            }
            catch (error) {
                console.error(`Error creating table ${tableName}:`, error.message, error.stack);
            }
        }
    });
}
/**
 * Reads JSON data from a file and inserts each item into the corresponding table.
 * Example: If the file is "transactions.json", data goes into the "Transaction" model.
 */
function seedData(tableName, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Read JSON file contents
        const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
        // Convert table name from plural to singular and uppercase the first letter
        const formattedTableName = pluralize_1.default.singular(tableName.charAt(0).toUpperCase() + tableName.slice(1));
        console.log(`Seeding data to table: ${formattedTableName}`);
        // Insert records one by one
        for (const item of data) {
            try {
                yield dynamoose_1.default.model(formattedTableName).create(item);
            }
            catch (err) {
                console.error(`Unable to add item to ${formattedTableName}. Error:`, JSON.stringify(err, null, 2));
            }
        }
        console.log("\x1b[32m%s\x1b[0m", `Successfully seeded data to table: ${formattedTableName}`);
    });
}
/**
 * Deletes a single DynamoDB table (by name) using the global DynamoDBClient.
 */
function deleteTable(baseTableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteCommand = new client_dynamodb_1.DeleteTableCommand({ TableName: baseTableName });
        try {
            yield client.send(deleteCommand);
            console.log(`Table deleted: ${baseTableName}`);
        }
        catch (err) {
            if (err.name === "ResourceNotFoundException") {
                console.log(`Table does not exist: ${baseTableName}`);
            }
            else {
                console.error(`Error deleting table ${baseTableName}:`, err);
            }
        }
    });
}
/**
 * Lists all tables in the current environment and deletes each one.
 * Waits 800ms between deletions to avoid conflicts.
 */
function deleteAllTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const { TableNames } = yield client.send(new client_dynamodb_1.ListTablesCommand({}));
        if (TableNames && TableNames.length > 0) {
            for (const tableName of TableNames) {
                yield deleteTable(tableName);
                yield new Promise((resolve) => setTimeout(resolve, 800));
            }
        }
    });
}
/**
 * Main seed function that deletes all existing tables, recreates them,
 * and populates them with data from JSON files in the "data" directory.
 */
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Delete any existing tables
        yield deleteAllTables();
        // 2. Wait briefly to ensure they're actually gone
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        // 3. Create tables
        yield createTables();
        // 4. Seed data from the local "data" folder (JSON files)
        const seedDataPath = path_1.default.join(__dirname, "./data");
        const files = fs_1.default
            .readdirSync(seedDataPath)
            .filter((file) => file.endsWith(".json"));
        for (const file of files) {
            const tableName = path_1.default.basename(file, ".json");
            const filePath = path_1.default.join(seedDataPath, file);
            yield seedData(tableName, filePath);
        }
    });
}
/**
 * If this script is run directly via "node seedDynamodb.js" or "ts-node seedDynamodb.ts",
 * invoke the seed() function immediately. Otherwise, it's just exported.
 */
if (require.main === module) {
    seed().catch((error) => {
        console.error("Failed to run seed script:", error);
    });
}
