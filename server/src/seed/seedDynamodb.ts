import {
  DynamoDBClient,
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import fs from "fs";
import path from "path";
import dynamoose from "dynamoose";
import pluralize from "pluralize";
import Transaction from "../models/transactionModel";
import Course from "../models/courseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import dotenv from "dotenv";

dotenv.config();

/** Determines if we run locally (DynamoDB Local) or in production (AWS DynamoDB). */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Global DynamoDBClient instance.
 * In local mode, points to "http://localhost:8001".
 * In production mode, uses AWS region "eu-central-1" (or from process.env).
 */
let client: DynamoDBClient;

if (!isProduction) {
  // Use DynamoDB Local
  dynamoose.aws.ddb.local();
  client = new DynamoDBClient({
    endpoint: "http://localhost:8001",
    region: "eu-central-1",
    credentials: {
      accessKeyId: "dummyKey123",
      secretAccessKey: "dummyKey123",
    },
  });
} else {
  // Use AWS DynamoDB in "eu-central-1" (or an AWS_REGION env variable)
  client = new DynamoDBClient({
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
async function createTables() {
  const models = [Transaction, UserCourseProgress, Course];

  for (const model of models) {
    const tableName = model.name; // e.g. "Transaction"
    const table = new dynamoose.Table(tableName, [model], {
      create: true,
      update: true,
      waitForActive: true,
      throughput: { read: 5, write: 5 },
    });

    try {
      // Short pause before initialization to ensure readiness
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await table.initialize();
      console.log(`Table created and initialized: ${tableName}`);
    } catch (error: any) {
      console.error(
        `Error creating table ${tableName}:`,
        error.message,
        error.stack
      );
    }
  }
}

/**
 * Reads JSON data from a file and inserts each item into the corresponding table.
 * Example: If the file is "transactions.json", data goes into the "Transaction" model.
 */
async function seedData(tableName: string, filePath: string) {
  // Read JSON file contents
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Convert table name from plural to singular and uppercase the first letter
  const formattedTableName = pluralize.singular(
    tableName.charAt(0).toUpperCase() + tableName.slice(1)
  );
  console.log(`Seeding data to table: ${formattedTableName}`);

  // Insert records one by one
  for (const item of data) {
    try {
      await dynamoose.model(formattedTableName).create(item);
    } catch (err) {
      console.error(
        `Unable to add item to ${formattedTableName}. Error:`,
        JSON.stringify(err, null, 2)
      );
    }
  }
  console.log(
    "\x1b[32m%s\x1b[0m",
    `Successfully seeded data to table: ${formattedTableName}`
  );
}

/**
 * Deletes a single DynamoDB table (by name) using the global DynamoDBClient.
 */
async function deleteTable(baseTableName: string) {
  const deleteCommand = new DeleteTableCommand({ TableName: baseTableName });
  try {
    await client.send(deleteCommand);
    console.log(`Table deleted: ${baseTableName}`);
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Table does not exist: ${baseTableName}`);
    } else {
      console.error(`Error deleting table ${baseTableName}:`, err);
    }
  }
}

/**
 * Lists all tables in the current environment and deletes each one.
 * Waits 800ms between deletions to avoid conflicts.
 */
async function deleteAllTables() {
  const { TableNames } = await client.send(new ListTablesCommand({}));
  if (TableNames && TableNames.length > 0) {
    for (const tableName of TableNames) {
      await deleteTable(tableName);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

/**
 * Main seed function that deletes all existing tables, recreates them,
 * and populates them with data from JSON files in the "data" directory.
 */
export default async function seed() {
  // 1. Delete any existing tables
  await deleteAllTables();
  // 2. Wait briefly to ensure they're actually gone
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 3. Create tables
  await createTables();

  // 4. Seed data from the local "data" folder (JSON files)
  const seedDataPath = path.join(__dirname, "./data");
  const files = fs
    .readdirSync(seedDataPath)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const tableName = path.basename(file, ".json");
    const filePath = path.join(seedDataPath, file);
    await seedData(tableName, filePath);
  }
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
