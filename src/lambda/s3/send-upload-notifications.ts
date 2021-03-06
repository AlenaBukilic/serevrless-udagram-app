require('source-map-support').install();
import { SNSEvent, SNSHandler, S3Event } from 'aws-lambda';
import * as AWS  from 'aws-sdk';
import { ApiGatewayManagementApi } from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

const connectionsTable = process.env.CONNECTIONS_TABLE;
const stage = process.env.STAGE;
const apiId = process.env.API_ID;

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
};

const apiGateway = new ApiGatewayManagementApi(connectionParams);

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event));

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        console.log('Processing s3 event: ', s3EventStr);
        const s3Event = JSON.parse(s3EventStr);
        await processS3Event(s3Event);
    }
}

const processS3Event = async (event: S3Event) => {

    for (const record of event.Records) {
        const key = record.s3.object.key;
        console.log('Processing s3 item with key: ', key);

        const connections = await docClient.scan({
            TableName: connectionsTable,
        }).promise()

        const payload = {
            imageId: key
        }

        for (const connection of connections.Items) {
            const connectionId = connection.id;
            await sendMessageToClient(connectionId, payload);
        }
    }
}

const sendMessageToClient = async (connectionId, payload) => {

    try {
        console.log('Sending message to connection: ', connectionId);

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise()
    }
    catch (err) {
        console.log('Failed to send message: ', JSON.stringify(err));

        if (err.statusCode === 410) {
            console.log('Stale connection');

            await docClient.delete({
                TableName: connectionsTable,
                Key: {
                    id: connectionId
                }
            }).promise();
        }
    }
}
