import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

interface BackendLambdaProps {
  s3BucketName: string;
  cloudFrontDomain: string;
  stripeSecretKey: string;
  clerkPublishableKey: string;
  clerkSecretKey: string;
}

export class BackendLambda extends Construct {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: BackendLambdaProps) {
    super(scope, id);

    this.lambdaFunction = new lambda.Function(this, 'LmsExpressLambda', {
      functionName: 'lms-express-lambda',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../server/src')),
      environment: {
        NODE_ENV: 'production',
        S3_BUCKET_NAME: props.s3BucketName,
        CLOUDFRONT_DOMAIN: props.cloudFrontDomain,
        STRIPE_SECRET_KEY: props.stripeSecretKey,
        CLERK_PUBLISHABLE_KEY: props.clerkPublishableKey,
        CLERK_SECRET_KEY: props.clerkSecretKey,
      },
    });

    // Grant DynamoDB Permissions
    this.lambdaFunction.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
    );
  }
}