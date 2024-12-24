import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';

export class AwsCdkLmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===================== Add Global Tag ===================== //
    cdk.Tags.of(this).add('Project', 'learning-management-system');

      // 1. Create Lambda function
      const backendLambda = new lambda.Function(this, 'LmsExpressLambda', {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(
          // Path to your compiled code (assuming `dist/index.js`).
          path.join(__dirname, '../../server/dist')
        ),
        environment: {
          // Set your environment variables here
          // For production, consider using Secrets Manager or Parameter Store
          NODE_ENV: 'production', // or "development"
          S3_BUCKET_NAME: 'learning-management-system-s3',
          CLOUDFRONT_DOMAIN: 'https://d1j25vaoxhur7i.cloudfront.net',
          STRIPE_SECRET_KEY: 'sk_test_51QWhSCE2CXYEEYdEYO3TotOgf6FkyNKaqCBFymdyF418d0h9QCiw6lAzVAyCXo5MWsunNBxhhzJRjQE1dsqptVBi00ay5MIX8Z',
          CLERK_PUBLISHABLE_KEY: 'pk_test_cXVhbGl0eS1oYXJlLTUuY2xlcmsuYWNjb3VudHMuZGV2JA',
          CLERK_SECRET_KEY: 'sk_test_o7htYSuFn3KR3kCoMtoykBfsc2xnzxFn4lHCV0fLTV',
        }
      });

      // 2. Grant DynamoDB Permissions
      // Option A: Attach an AWS-managed policy with broad permissions
      backendLambda.role?.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
      );


      // 2. Create an API Gateway to proxy all requests to the Lambda
      const backendApi = new apigateway.LambdaRestApi(this, 'LmsApiGateway', {
        handler: backendLambda,
        // If you want to configure custom domain, logging, etc.,
        // you can do so here. By default it will create a new API
        // with a proxy integration for your Lambda.
        proxy: true,
        deployOptions: {
          stageName: 'dev', // e.g. /dev
        },
      });

      // 3. Output the API endpoint
      new cdk.CfnOutput(this, 'LmsApiUrl', {
        value: backendApi.url,
        description: 'The base URL of the LMS backend API',
      });
    }


}


