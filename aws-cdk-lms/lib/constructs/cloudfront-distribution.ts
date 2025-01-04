import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface LmsCloudFrontDistributionProps {
  s3Bucket: s3.Bucket;
}

export class LmsCloudFrontDistribution extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: LmsCloudFrontDistributionProps) {
    super(scope, id);

    this.distribution = new cloudfront.Distribution(this, 'LmsCloudFrontDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(props.s3Bucket),
      },
      defaultRootObject: 'index.html',
    });
  }
}