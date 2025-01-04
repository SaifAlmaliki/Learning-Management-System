import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class LmsS3Bucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Generate a unique bucket name
    const bucketName = `lms-s3-${cdk.Stack.of(this).account}`;

    // Create the S3 bucket
    this.bucket = new s3.Bucket(this, 'LmsS3Bucket', {
      bucketName: bucketName, // Use the unique bucket name
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
    });
  }
}