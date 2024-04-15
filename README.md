# Test assignment

API Gateway - S3 - AWS Lambda - DynamoDb - SQS

1. AWS API Gateway: Provide endpoint to upload file. Clients will use REST API to upload files to S3. AWS Lambda is used for upload.
1. AWS S3: All files are uploaded here. When a new file gets uploaded into the specified S3 bucket, this should trigger a Lambda function.
1. AWS Lambda: It is triggered whenever a new file is uploaded into the S3 bucket. This function should pick up the file's metadata.
1. AWS DynamoDB: Stores file metadata.
1. AWS SQS: When the Lambda function is triggered, it should put a message with the file's metadata into an SQS queue for further processing.

## Useful commands

* `cdk deploy`  deploy this stack to your default AWS account/region
* `cdk diff`    compare deployed stack with current state
* `cdk synth`   emits the synthesized CloudFormation template

## Activate user
```
aws cognito-idp admin-set-user-password --user-pool-id <user-user_pool_id-id> --username <username> --password <password> --permanent
```
"<user_pool_id>" can be found in cfn outputs or on the User pool details page.

## Get auth token
```
aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id <client_id> --auth-parameters USERNAME=<username>,PASSWORD=<password>
```
"<client_id>" can be found in the "App integration" tab in the User pool details page