import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface CertificateStackProps extends cdk.StackProps {
  domainName: string;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: props.env?.account || process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1', // Certificate must be in us-east-1
      },
      crossRegionReferences: true, // Enable cross-region references
    });

    // Look up the hosted zone within the stack scope
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'cognitechx.com', // Your root domain
    });

    // Create the SSL certificate
    this.certificate = new acm.Certificate(this, 'ApiGatewayCertificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
  }
}