import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as deploy from '@aws-cdk/aws-s3-deployment';

const WEB_APP_DOMAIN = "sharing.alfw.de"

export class Stack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id, {
            env: {
                account: "494131715847",
                region: "ap-northeast-2"
            }
        });

        //Get The Hosted Zone

        const zone = route53.HostedZone.fromLookup(this, "Zone", {
            domainName: "alfw.de",
        });

        //Create S3 Bucket for our website
        const siteBucket = new s3.Bucket(this, "SiteBucket", {
            bucketName: WEB_APP_DOMAIN,
            websiteIndexDocument: "index.html",
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        //Create Certificate
        const siteCertificateArn = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
            domainName: WEB_APP_DOMAIN,
            hostedZone: zone,
            region: "us-east-1"  //standard for acm certs
        }).certificateArn;


        //Create CloudFront Distribution
        const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
            aliasConfiguration: {
                acmCertRef: siteCertificateArn,
                names: [WEB_APP_DOMAIN],
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019
            },
            originConfigs: [{
                customOriginSource: {
                    domainName: siteBucket.bucketWebsiteDomainName,
                    originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
                },
                behaviors: [{
                    isDefaultBehavior: true
                }]
            }]
        });

        //Create A Record Custom Domain to CloudFront CDN
        new route53.ARecord(this, "SiteRecord", {
            recordName: WEB_APP_DOMAIN,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteDistribution)),
            zone
        });

        //Deploy site to s3
        new deploy.BucketDeployment(this, "Deployment", {
            sources: [deploy.Source.asset("./build")],
            destinationBucket: siteBucket,
            distribution: siteDistribution,
            distributionPaths: ["/*"]

        });
    }
}