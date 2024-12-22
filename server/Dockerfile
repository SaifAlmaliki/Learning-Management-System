# Use the AWS Lambda Node.js 20 base image
FROM public.ecr.aws/lambda/nodejs:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and lock file, install dependencies
COPY package*.json ./
RUN microdnf update -y && microdnf install -y gcc-c++ make python3 \
    && npm install --verbose

# Copy application source code and build TypeScript files
COPY . .
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Production image based on the same Lambda base image
FROM public.ecr.aws/lambda/nodejs:20

# Set the working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy necessary files from the build stage
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=build /app/package*.json ${LAMBDA_TASK_ROOT}

# Set environment variables
ENV NODE_ENV=production

# Command to start the Lambda function
CMD ["index.handler"]
