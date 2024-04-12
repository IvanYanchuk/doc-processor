import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class MetadataProcessorStack extends cdk.Stack {
    public readonly docsBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = new s3.Bucket(this, 'DocsBucket', {
        cors: [
            {
                allowedMethods: [
                    cdk.aws_s3.HttpMethods.GET,
                    cdk.aws_s3.HttpMethods.PUT,
                    cdk.aws_s3.HttpMethods.POST,
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*'],
            },
        ],
    });

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, 'MetadataTable', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // Create an SQS queue
    const queue = new sqs.Queue(this, 'ProcessorQueue');

    // Create a Lambda function
    const metadataProcessorLambda = new NodejsFunction(this, 'MetadataProcessorLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: join(__dirname, '..', 'lambda', 'metadata-processor-handler.ts'),
        environment: {
            TABLE_NAME: table.tableName,
            QUEUE_URL: queue.queueUrl,
        }
    });

    metadataProcessorLambda.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [
            table.tableArn
        ],
        actions:[
            'dynamodb:PutItem',
            'dynamodb:Scan',
            'dynamodb:GetItem',
            // 'dynamodb:UpdateItem',
            // 'dynamodb:DescribeTable',
            // 'dynamodb:DeleteItem',
            // 'dynamodb:BatchWriteItem'
        ]
    }));

    metadataProcessorLambda.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [
            queue.queueArn
        ],
        actions:[
            'sqs:SendMessage',
            'sqs:GetQueueAttributes',
            'sqs:GetQueueUrl'
        ]
    }));

    metadataProcessorLambda.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetBucketNotification', 's3:PutBucketNotification'],
        resources: [ bucket.bucketArn ]
    }));

    // Trigger the Lambda function when a new object is uploaded to the S3 bucket
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(metadataProcessorLambda));

    this.docsBucket = bucket;
  }
}
