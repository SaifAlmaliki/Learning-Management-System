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
      memorySize: 1024,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../server/dist')),
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

    // Grant S3 Permissions
    this.lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:PutObject',
          's3:GetObject',
          's3:DeleteObject',
          's3:ListBucket',
          's3:GetObjectTagging',
          's3:PutObjectTagging'
        ],
        resources: [
          `arn:aws:s3:::${props.s3BucketName}`,
          `arn:aws:s3:::${props.s3BucketName}/*`
        ],
      })
    );
  }
}