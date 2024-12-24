#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkLmsStack } from '../lib/aws-cdk-lms-stack';

const app = new cdk.App();

new AwsCdkLmsStack(app, 'AwsCdkLmsStack', {
  env: { region: 'eu-central-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});