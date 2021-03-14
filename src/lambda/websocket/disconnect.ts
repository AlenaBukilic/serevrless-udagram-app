require('source-map-support').install();
import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS  from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('websocket connect evet: ', event);

    const connectionId = event.requestContext.connectionId;
    const key = {
        id: connectionId
    }

    await docClient.delete({
        TableName: connectionsTable,
        Key: key
    }).promise();

    return {
        statusCode: 200,
        body: ''
    }
}