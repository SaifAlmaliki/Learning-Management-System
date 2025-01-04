#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { AwsCdkLmsStack } from '../lib/aws-cdk-lms-stack';
import { CertificateStack } from '../lib/certificate-stack';

const app = new cdk.App();

// Define the environment (account and region)
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-central-1', // Default to eu-central-1 if not specified
};

// Deploy the CertificateStack in us-east-1
const certificateStack = new CertificateStack(app, 'CertificateStack', {
  domainName: 'learning.cognitechx.com', // Pass the domain name to the CertificateStack
  env: {
    account: env.account,
    region: 'us-east-1', // Certificate must be in us-east-1
  },
  crossRegionReferences: true, // Enable cross-region references
});

// Deploy the main stack in eu-central-1
new AwsCdkLmsStack(app, 'AwsCdkLmsStack', {
  env: env,
  certificate: certificateStack.certificate, // Pass the certificate to the main stack
  crossRegionReferences: true,
});