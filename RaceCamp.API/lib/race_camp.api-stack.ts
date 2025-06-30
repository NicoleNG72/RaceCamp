import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';

import { CfnOutput } from 'aws-cdk-lib';

import * as path from 'path';

export class RaceCampApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //new CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

    const hostBucket = new s3.Bucket(this, 'HostBucket', {
      bucketName: `host-bucket.s3.${process.env.AWS_REGION}.amazonaws.com`,
      versioned: true, 
      websiteIndexDocument:'index.html',
      // websiteErrorDocument: 'error.html',
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../RaceCamp.Web/dist'))],
      destinationBucket: hostBucket,
    });

    const cfDisctribution = new cloudfront.Distribution(this, 'CloudFrontDisctribution', {
      defaultBehavior: {
        origin: cloudfront_origins.S3BucketOrigin.withOriginAccessControl(hostBucket)
      }
    })

    new CfnOutput(this, 'DomainName', { value:  cfDisctribution.distributionDomainName + "/index.html"});
  }
}
