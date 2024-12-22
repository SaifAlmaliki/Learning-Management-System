import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as path from 'path';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';

export class AwsCdkLmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===================== Add Global Tag ===================== //
    cdk.Tags.of(this).add('Project', 'learning-management-system');
    /*
    // ===================== DynamoDB Tables ===================== //
    const coursesTable = new dynamodb.Table(this, 'CoursesTable', {
      tableName: 'Courses',
      partitionKey: { name: 'courseId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      tableName: 'Transactions',
      partitionKey: { name: 'transactionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userCourseProgressTable = new dynamodb.Table(this, 'UserCourseProgressTable', {
      tableName: 'UserCourseProgress',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'courseId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    */

    // ===================== S3 Bucket ===================== //
    const videoBucket = new s3.Bucket(this, 'VideoBucket', {
      bucketName: 'lms-video-bucket',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ===================== CloudFront Distribution ===================== //
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'VideoDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: videoBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    // ===================== CloudFront Origin Access Control (OAC) ===================== //
    const oac = new cloudfront.CfnOriginAccessControl(this, 'VideoBucketOAC', {
      originAccessControlConfig: {
        name: 'VideoBucketOAC',
        description: 'OAC for S3 bucket access',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    });

    // Attach the OAC to the origin in the distribution
    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.OriginAccessControlId',
      oac.attrId
    );

    // ===================== Lambda Function Using ECR ===================== //
    const ecrRepository = ecr.Repository.fromRepositoryName(this, 'LmsEcrRepository', 'lms-ecr');

    const lmsBackendLambda = new lambda.DockerImageFunction(this, 'LMSLambdaFunction', {
      functionName: 'lms-lambda',
      code: lambda.DockerImageCode.fromEcr(ecrRepository, {
        tagOrDigest: 'latest',
      }),
      memorySize: 1024,
      timeout: cdk.Duration.minutes(5),
      environment: {
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_test_51QWhSCE2CXYEEYdEYO3TotOgf6FkyNKaqCBFymdyF418d0h9QCiw6lAzVAyCXo5MWsunNBxhhzJRjQE1dsqptVBi00ay5MIX8Z',
        CLERK_PUBLISHABLE_KEY: 'pk_test_cXVhbGl0eS1oYXJlLTUuY2xlcmsuYWNjb3VudHMuZGV2JA',
        CLERK_SECRET_KEY: 'sk_test_o7htYSuFn3KR3kCoMtoykBfsc2xnzxFn4lHCV0fLTV',
        S3_BUCKET_NAME: 'lms-video-bucket',
      },
    });

    // Grant Lambda permissions to pull from the ECR repository
    ecrRepository.grantPull(lmsBackendLambda.role!);



    // Grant Lambda permissions to read/write to the DynamoDB table
  //  coursesTable.grantReadWriteData(lmsBackendLambda);
  //  transactionsTable.grantReadWriteData(lmsBackendLambda);
  //  userCourseProgressTable.grantReadWriteData(lmsBackendLambda);

    // ===================== API Gateway - Proxy Integration ===================== //
    const api = new apigateway.RestApi(this, 'LMSApiGateway', {
      restApiName: 'lm_api_gateway',
      description: 'API Gateway for LMS Backend using Lambda Proxy',
      deployOptions: {
        stageName: 'prod',
      },
    });

    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', new apigateway.LambdaIntegration(lmsBackendLambda));

    // ===================== Outputs ===================== //
    new cdk.CfnOutput(this, 'ApiGatewayURL', { value: api.url });
  //  new cdk.CfnOutput(this, 'CoursesTableName', { value: coursesTable.tableName });
    new cdk.CfnOutput(this, 'VideoBucketName', { value: videoBucket.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontURL', { value: distribution.distributionDomainName });
  }
}


