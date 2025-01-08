import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class LmsS3Bucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Generate a unique bucket name
    const bucketName = `lms-s3-${cdk.Stack.of(this).account}`;

    // Create the S3 bucket
    this.bucket = new s3.Bucket(this, 'LmsS3Bucket', {
      bucketName: bucketName,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],  // Allow all origins for development
          exposedHeaders: [
            'ETag',
            'x-amz-meta-custom-header',
            'x-amz-server-side-encryption',
            'x-amz-request-id',
            'x-amz-id-2'
          ],
          maxAge: 3000,
        },
      ],
      // Allow public read access for development
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      })
    });

    // Add bucket policy to allow necessary actions
    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:GetObject',
        's3:DeleteObject',
        's3:ListBucket'
      ],
      resources: [
        this.bucket.bucketArn,
        `${this.bucket.bucketArn}/*`
      ],
      principals: [new iam.AnyPrincipal()]
    });

    this.bucket.addToResourcePolicy(bucketPolicy);
  }
}