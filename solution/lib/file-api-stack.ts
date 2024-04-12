import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';

interface FileApiStackProps extends cdk.StackProps {
    docsBucket: IBucket
}

export class FileApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: FileApiStackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketArn(this, 'ImportedBucket', props.docsBucket.bucketArn);

    const api = new RestApi(this, 'FileApi', {
        binaryMediaTypes: ["*/*"],
        endpointConfiguration: {
            types: [EndpointType.EDGE]
        }
    });

    // Create a Lambda function
    const fileProcessorLambda = new NodejsFunction(this, 'FileProcessorLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: join(__dirname, '..', 'lambda', 'file-processor-handler.ts'),
        environment: {
            BUCKET_NAME: bucket.bucketName,
        }
    });

    bucket.grantPut(fileProcessorLambda);
    bucket.grantPutAcl(fileProcessorLambda);

    // Plug the Lambda function into API Gateway, and enable CORS
    const uploadFileResource = api.root.addResource('uploadFile');
    uploadFileResource.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(fileProcessorLambda));
    uploadFileResource.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['POST'],
    });

    // const bucketItemResource = api.root.addResource("{item}");

    // const role = new Role(this, 's3accessRole', {
    //     assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    // });

    // role.addToPolicy(new PolicyStatement({
    //     resources: [ bucket.bucketArn ],
    //     actions: ['s3:PutObject']
    // }))

    // const integration = new AwsIntegration({
    //     service: 's3',
    //     region: "us-east-1",
    //     integrationHttpMethod: 'PUT',
    //     path: '{bucket}/{object}',
    //     options: {
    //         credentialsRole: role,
    //         requestParameters: {
    //             'integration.request.path.bucket': `'${bucket.bucketName}'`,
    //             'integration.request.path.object': 'method.request.path.item',
    //             'integration.request.header.Accept': 'method.request.header.Accept' 
    //         },
    //         integrationResponses: [
    //             {
    //                 statusCode: '200',
    //                 responseParameters: { 'method.response.header.Content-Type': 'integration.response.header.Content-Type'}
    //             }
    //         ],
    //         passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
    //       },
    // });

    // bucketItemResource.addMethod('PUT', integration, {
    //     authorizationType: AuthorizationType.NONE,
    //     methodResponses: [
    //         {
    //             statusCode: '200',
    //             responseParameters: {
    //               'method.response.header.Content-Type': true
    //             }
    //         }
    //     ],
    //     requestParameters: {
    //         'method.request.path.item': true,
    //         'method.request.header.Accept': true,
    //         'method.request.header.Content-Type': true
    //     },
    // });
  }
}