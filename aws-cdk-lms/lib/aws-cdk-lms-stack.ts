import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BackendLambda } from './constructs/backend-lambda';
import { LmsS3Bucket } from './constructs/s3-bucket';
import { LmsCloudFrontDistribution } from './constructs/cloudfront-distribution';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define a custom interface for the stack props
export interface AwsCdkLmsStackProps extends cdk.StackProps {
  certificate: acm.Certificate; // Add certificate property
}

export class AwsCdkLmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsCdkLmsStackProps) {
    super(scope, id, {
      ...props,
      crossRegionReferences: props.crossRegionReferences, // Enable cross-region references
    });

    // Add Global Tag
    cdk.Tags.of(this).add('Project', 'learning-management-system');

    // 1. Create S3 Bucket
    const s3Bucket = new LmsS3Bucket(this, 'LmsS3Bucket');

    // 2. Create CloudFront Distribution
    const cloudFrontDistribution = new LmsCloudFrontDistribution(this, 'LmsCloudFrontDistribution', {
      s3Bucket: s3Bucket.bucket,
    });

    // 3. Retrieve sensitive environment variables from .env file
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!stripeSecretKey || !clerkPublishableKey || !clerkSecretKey) {
      throw new Error('Missing required environment variables in .env file');
    }

    // 4. Create the Lambda function
    const backendLambda = new BackendLambda(this, 'BackendLambda', {
      s3BucketName: s3Bucket.bucket.bucketName,
      cloudFrontDomain: cloudFrontDistribution.distribution.distributionDomainName,
      stripeSecretKey,
      clerkPublishableKey,
      clerkSecretKey,
    });

    // 5. Create an API Gateway to proxy all requests to the Lambda
    const backendApi = new apigateway.LambdaRestApi(this, 'LmsApiGateway', {
      restApiName: 'lms-api-gw',
      handler: backendLambda.lambdaFunction,
      proxy: true,
      deployOptions: {
        stageName: 'dev',
        description: 'Development Stage for the LMS Backend',
      },
    });

    // 6. Set up a custom domain for the API Gateway
    const domainName = 'academyapi.cognitechx.com'; // Subdomain for API Gateway

    // Look up the hosted zone within the stack scope
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'cognitechx.com', // Your root domain
    });

    // 7. Create the custom domain for API Gateway
    const apiDomain = new apigateway.DomainName(this, 'ApiGatewayDomain', {
      domainName: domainName,
      certificate: props.certificate, // Use the certificate passed as a prop
      endpointType: apigateway.EndpointType.EDGE, // Use Edge-optimized endpoint
    });

    // 8. Map the custom domain to the API Gateway
    apiDomain.addBasePathMapping(backendApi, {
      stage: backendApi.deploymentStage, // Map to the 'dev' stage
    });

    // 9. Create a Route 53 record to point to the API Gateway custom domain
    new route53.ARecord(this, 'ApiGatewayAliasRecord', {
      zone: hostedZone, // Use the hosted zone looked up in this stack
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new route53Targets.ApiGatewayDomain(apiDomain)),
    });

    // 10. Output the custom API endpoint
    new cdk.CfnOutput(this, 'LmsApiUrl', {
      value: `https://${domainName}/dev`, // Use the custom domain
      description: 'The base URL of the LMS backend API',
    });
  }
}