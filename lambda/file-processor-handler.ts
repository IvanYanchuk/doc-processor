import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

async function handler(event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {
    const bucketName = process.env.BUCKET_NAME;
    const newGuid = v4();
    const keyName = `${newGuid}.txt`;
    const fileContent = event["body"];

    const putObjectParams = {
        Bucket: bucketName,
        Key: keyName,
        Body: atob(fileContent),
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(putObjectParams));
        console.log('Success', data);
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Successfully put file to bucket',
          }),
        };
    } catch (err) {
        console.log('Error', err);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Failed to put file to bucket',
          }),
        };
    }
}

export { handler };