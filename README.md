# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

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