import { S3Event } from "aws-lambda";
import { v4 } from "uuid";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const ddbClient = new DynamoDBClient({});
const sqsClient = new SQSClient({});

async function handler(event: S3Event) {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;

        const randomId = v4();
        const item = record.s3.object;
        item.id = randomId;

        // Store metadata to DynamoDB
        const result = await ddbClient.send(new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(item)
        }));

        console.log(result);

        const command = new SendMessageCommand({
            QueueUrl: process.env.QUEUE_URL,
            MessageBody: `File ${key} has been uploaded to bucket ${bucket}.`
        });

        await sqsClient.send(command);
    }
}

export { handler };