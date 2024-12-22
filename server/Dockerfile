# Use the AWS Lambda Node.js 20 base image
FROM public.ecr.aws/lambda/nodejs:20 AS build

# Set the working directory
WORKDIR /app

# Copy only package.json and lock file first
COPY package*.json ./

# Debugging step to verify package.json is copied
RUN ls -l /app

# Install dependencies with verbose logs
RUN microdnf update -y && microdnf install -y gcc-c++ make python3
RUN npm install --verbose

# Copy the rest of the application's source code
COPY . .

# Build TypeScript files
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Use a second stage for the production image
FROM public.ecr.aws/lambda/nodejs:20

# Set the working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built files and production dependencies from the build stage
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=build /app/package*.json ${LAMBDA_TASK_ROOT}

# Set environment variables
ENV NODE_ENV=production

# Command to start the Lambda function
CMD ["index.handler"]
